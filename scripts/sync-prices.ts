
import axios from 'axios';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQtttJgxlXlRGy84m6PfCqE-R_YmkAPujL1CkyhHhjNmPDMz5nXKVznj6ybpIn2uVjQzhoce9Yi-Jgl/pub?output=csv';
const CONSTANTS_PATH = path.join(process.cwd(), 'src', 'constants.ts');

async function sync() {
  try {
    console.log('Fetching sheet data...');
    const response = await axios.get(SHEET_URL);
    const records = parse(response.data, {
      columns: false,
      skip_empty_lines: true,
    });

    // Find the ACTIVE_SALE_NAME from the constants file
    const constantsContent = fs.readFileSync(CONSTANTS_PATH, 'utf-8');
    const saleMatch = constantsContent.match(/export const ACTIVE_SALE_NAME = ["'](.+)["']/);
    if (!saleMatch) {
      console.error('Could not find ACTIVE_SALE_NAME in src/constants.ts');
      return;
    }
    const targetSale = saleMatch[1].toLowerCase();
    console.log(`Syncing for active sale: "${saleMatch[1]}"`);

    let regularPrices: any = null;
    let salePrices: any = null;

    let currentCategory = '';

    for (const row of records) {
      // Row structure: [A: empty, B: Category, C: Field, D: Rise, E: Pro, F: Advance]
      const category = row[1]?.trim();
      const field = row[2]?.trim();
      
      if (category) {
        currentCategory = category;
      }

      const activeCat = currentCategory.toLowerCase();

      if (field === 'Price') {
        const prices = {
          rise: row[3],
          pro: row[4],
          advance: row[5]
        };

        if (activeCat === 'regular') {
          regularPrices = prices;
        }

        // Match the target sale name (case-insensitive and partial match)
        if (activeCat.includes(targetSale)) {
          salePrices = prices;
        }
      }
    }

    if (!regularPrices) {
      console.error('ERROR: Could not find "Regular" prices in the sheet.');
      return;
    }
    if (!salePrices) {
      console.error(`ERROR: Could not find prices for sale "${saleMatch[1]}" in the sheet.`);
      return;
    }

    // Prepare the new PLANS array
    const newPlans = [
      {
        id: 'rise',
        name: 'Rise',
        price: salePrices.rise,
        oldPrice: regularPrices.rise === salePrices.rise ? undefined : regularPrices.rise,
        duration: '(01 month)',
      },
      {
        id: 'advance',
        name: 'Advance',
        price: salePrices.advance,
        oldPrice: regularPrices.advance === salePrices.advance ? undefined : regularPrices.advance,
        duration: '(lifetime)',
        isFeatured: true,
      },
      {
        id: 'pro',
        name: 'Pro',
        price: salePrices.pro,
        oldPrice: regularPrices.pro === salePrices.pro ? undefined : regularPrices.pro,
        duration: '(06 months)',
      },
    ];

    // Reconstruct the file content
    const plansRegex = /export const PLANS: PricingPlan\[\] = \[([\s\S]+?)\];/;
    const newPlansString = `export const PLANS: PricingPlan[] = ${JSON.stringify(newPlans, null, 2)};`;
    
    const updatedContent = constantsContent.replace(plansRegex, newPlansString);
    
    fs.writeFileSync(CONSTANTS_PATH, updatedContent);
    console.log('✅ Successfully updated src/constants.ts with new pricing data!');
    console.log(`Rise: ${salePrices.rise} (Was ${regularPrices.rise})`);
    console.log(`Pro: ${salePrices.pro} (Was ${regularPrices.pro})`);
    console.log(`Advance: ${salePrices.advance} (Was ${regularPrices.advance})`);

  } catch (err) {
    console.error('Sync failed:', err);
  }
}

sync();
