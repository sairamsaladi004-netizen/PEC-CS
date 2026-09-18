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

// Mount dedicated static routes for /js and /css with strict MIME types
app.use('/js', express.static(path.join(__dirname, 'js'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Content-Type', 'text/javascript; charset=UTF-8');
  }
}));

app.use('/css', express.static(path.join(__dirname, 'css'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Content-Type', 'text/css; charset=UTF-8');
  }
}));

// Route interceptor: If a nested route (e.g. /club-dashboard/js/app.js) requests /js/ or /css/, resolve from root
app.use((req, res, next) => {
  const jsIndex = req.path.indexOf('/js/');
  if (jsIndex > 0) {
    const subpath = req.path.substring(jsIndex + 4);
    res.setHeader('Content-Type', 'text/javascript; charset=UTF-8');
    return res.sendFile(path.join(__dirname, 'js', subpath));
  }
  const cssIndex = req.path.indexOf('/css/');
  if (cssIndex > 0) {
    const subpath = req.path.substring(cssIndex + 5);
    res.setHeader('Content-Type', 'text/css; charset=UTF-8');
    return res.sendFile(path.join(__dirname, 'css', subpath));
  }
  next();
});

// Serve static assets from project root with proper MIME types
app.use(express.static(__dirname, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'text/javascript; charset=UTF-8');
    }
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=UTF-8');
    }
  }
}));

// Guard: Static asset requests (.js, .css, .json, etc.) must NEVER fall through to HTML SPA fallback
app.use((req, res, next) => {
  if (/\.(js|mjs|css|json|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i.test(req.path)) {
    return res.status(404).type('text/plain').send(`Asset not found: ${req.path}`);
  }
  next();
});

// SPA fallback for HTML navigation routes
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

