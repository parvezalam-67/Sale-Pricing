
import axios from 'axios';
import { parse } from 'csv-parse/browser/esm';
import { PricingPlan } from '../types';

const BASE_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQtttJgxlXlRGy84m6PfCqE-R_YmkAPujL1CkyhHhjNmPDMz5nXKVznj6ybpIn2uVjQzhoce9Yi-Jgl/pub?output=csv';
const GIDS = ['0', '977639145']; // 0 is Signals (main), 977639145 is Products

export interface SalePricing {
  saleName: string;      // Full name including percent (e.g. "Ramadan Mega Sale UPTO 70%")
  displayName: string;   // Clean name for headline (e.g. "Ramadan Mega Sale")
  discountPercent: string; // Extracted percent (e.g. "70")
  plans: PricingPlan[];
}

export interface AllSalesData {
  [key: string]: SalePricing[];
}

export async function fetchAllSales(): Promise<AllSalesData> {
  const allResults: AllSalesData = {};
  
  for (const gid of GIDS) {
    try {
      // Fetching data via backend proxy to avoid CORS
      const response = await axios.get(`/api/proxy-sheet?gid=${gid}&t=${Date.now()}`);
      const records: string[][] = await new Promise((resolve, reject) => {
        parse(response.data, {
          columns: false,
          skip_empty_lines: true,
        }, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });

      if (records.length < 3) {
        console.warn(`GID ${gid} returned too few records.`);
        continue;
      }

      const categoriesRow = records[1];
      const categories: { name: string; startIndex: number; key: string }[] = [];

      for (let i = 1; i < categoriesRow.length; i++) {
        let name = categoriesRow[i]?.trim();
        if (name) {
          // Remove "SureshotFX" prefix (case-insensitive)
          name = name.replace(/SureshotFX/gi, '').trim();

          let key = name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
          
          if (key === 'forex_gold_indices' || key === 'forex_gold_indices_signals') key = 'combo';
          if (key === 'singals') key = 'signals';
          categories.push({ name, startIndex: i, key });
        }
      }

      // Parse data rows

      let currentCategory = '';
      const dataStore: Record<string, Record<string, Record<string, any>>> = {};

      for (const row of records) {
        const catHeader = row[1]?.trim();
        const field = row[2]?.trim();
        
        if (catHeader) {
          currentCategory = catHeader.replace(/\n/g, ' ');
        }

        if (!currentCategory) continue;
        if (!dataStore[currentCategory]) dataStore[currentCategory] = {};
        if (!dataStore[currentCategory][field]) dataStore[currentCategory][field] = {};

        for (const cat of categories) {
          // Ensure we don't go out of bounds
          if (cat.startIndex + 4 < row.length) {
            dataStore[currentCategory][field][cat.key] = {
              rise: row[cat.startIndex + 2],
              pro: row[cat.startIndex + 3],
              advance: row[cat.startIndex + 4]
            };
          }
        }
      }

      const regularData = dataStore['Regular'] || dataStore['regular'] || dataStore['Basic'] || dataStore['basic'];

      for (const cat of categories) {
        const type = cat.key;
        const regular = regularData?.['Price']?.[type];

        const sales = Object.keys(dataStore)
          .filter(sHeader => {
            const l = sHeader.toLowerCase();
            return l !== 'regular' && l !== 'basic' && l !== 'start:' && l !== 'end:';
          })
          .map(sHeader => {
            const catData = dataStore[sHeader];
            const prices = catData['Price']?.[type];
            if (!prices) return null;
            
            // Allow if at least one price exists
            if (!prices.rise && !prices.pro && !prices.advance) return null;

            const durations = catData['Duration']?.[type] || { rise: '(01 month)', pro: '(06 months)', advance: '(lifetime)' };
            
            const percentMatch = sHeader.match(/(\d+)\s*%/);
            let discount = percentMatch ? percentMatch[1] : '';
            let displayName = sHeader
              .replace(/Sureshot/gi, '')
              .replace(/Upto\s*\d+\s*%/gi, '')
              .replace(/\d+\s*%\s*OFF/gi, '')
              .replace(/\s+/g, ' ')
              .trim();

            return {
              saleName: sHeader.replace(/Sureshot/gi, '').trim(),
              displayName: displayName || sHeader,
              discountPercent: discount,
              plans: [
                { 
                  id: 'rise', 
                  name: 'Rise', 
                  price: prices.rise, 
                  oldPrice: regular?.rise === prices.rise ? undefined : regular?.rise, 
                  duration: durations.rise 
                },
                { 
                  id: 'advance', 
                  name: 'Advance', 
                  price: prices.advance, 
                  oldPrice: regular?.advance === prices.advance ? undefined : regular?.advance, 
                  duration: durations.advance, 
                  isFeatured: true 
                },
                { 
                  id: 'pro', 
                  name: 'Pro', 
                  price: prices.pro, 
                  oldPrice: regular?.pro === prices.pro ? undefined : regular?.pro, 
                  duration: durations.pro 
                },
              ]
            };
          })
          .filter(s => s !== null) as SalePricing[];

        if (sales.length > 0) {
          allResults[type] = sales;
        }
      }
    } catch (e) {
      console.error(`Error fetching gid ${gid}:`, e);
    }
  }

  return allResults;
}
