import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './backend/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// Body parser
app.use(express.json());

// Mount REST API before static assets so /api/* routes are never intercepted
app.use('/api', apiRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'PEC CampusTech - Pragati University Club Management System' });
});

// Serve static assets from project root
app.use(express.static(__dirname));

// SPA fallback for Express 5
app.get('*all', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start listener when not running inside a serverless function environment
if (!process.env.VERCEL) {
  app.listen(PORT, HOST, () => {
    console.log(`Pragati University PEC CampusTech server listening on http://${HOST}:${PORT}`);
  });
}

export default app;

