import express from 'express';
import cors from 'cors';
import axios from 'axios';

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

export default app;
