import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const app = express();

app.use(cors());
app.use(express.json());

// Proxy endpoint for Google Sheets
app.get('/api/proxy-sheet', async (req: any, res: any) => {
  const { gid } = req.query;
  const maxRetries = 3;
  let attempts = 0;

  const fetchWithRetry = async (): Promise<any> => {
    attempts++;
    try {
      const baseUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQtttJgxlXlRGy84m6PfCqE-R_YmkAPujL1CkyhHhjNmPDMz5nXKVznj6ybpIn2uVjQzhoce9Yi-Jgl/pub';
      return await axios.get(baseUrl, {
        params: {
          output: 'csv',
          gid: gid,
          single: 'true',
          t: Date.now()
        },
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/csv, application/csv, text/plain'
        }
      });
    } catch (error: any) {
      if (attempts < maxRetries && (!error.response || error.response.status >= 500)) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchWithRetry();
      }
      throw error;
    }
  };

  try {
    const response = await fetchWithRetry();
    res.setHeader('Content-Type', 'text/csv');
    res.send(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      res.status(504).json({ error: 'Gateway Timeout after retries' });
    }
  }
});

// Image generation endpoint using Gemini's Imagen model
app.post('/api/generate-image', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({
      error: 'GEMINI_API_KEY is not set on the server. Please set it in .env.local'
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    const base64Image = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64Image) {
      throw new Error('No image bytes returned from Imagen API');
    }

    res.json({ image: `data:image/jpeg;base64,${base64Image}` });
  } catch (error: any) {
    console.error('[generate-image] Error:', error.message || error);
    res.status(500).json({ error: 'Failed to generate image', details: error.message || String(error) });
  }
});

export default app;
