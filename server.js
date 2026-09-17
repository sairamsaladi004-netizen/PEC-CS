import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './backend/api.js';
import { fetchFullDatabaseFromSupabase, isSupabaseConfigured } from './backend/db.js';
import { initializeDatabase } from './scripts/init_database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// Security hardening
app.disable('x-powered-by');

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Initialize database schema and seed mock data if missing or empty
initializeDatabase().catch(err => {
  console.warn("[Server Startup] Database initialization notice:", err.message);
});

// Trigger initial Supabase synchronization if credentials present
if (isSupabaseConfigured()) {
  fetchFullDatabaseFromSupabase().catch(err => {
    console.warn("[Server Startup] Supabase warm-up notice:", err.message);
  });
}

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

