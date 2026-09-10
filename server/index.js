require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { initDb, getDatabaseStatus } = require('./db');
const { startKeepAlivePinger } = require('./services/pinger');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');

// Configure Helmet with relaxed CSP for Razorpay, Google Fonts, and dynamic canvas
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://checkout.razorpay.com", "https://cdn.jsdelivr.net"],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://*.razorpay.com", "https://*.elevatifier.com", "https://services.elevatifier.com"],
        connectSrc: ["'self'", "https://api.razorpay.com", "https://lumberjack.razorpay.com", "https://*.razorpay.com", "https://*.elevatifier.com"],
        frameSrc: ["https://api.razorpay.com", "https://checkout.razorpay.com"],
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api', apiRoutes);

// Health check endpoint for Render pod monitoring and keep-alive pinger
app.get('/healthz', (req, res) => {
  const dbStatus = getDatabaseStatus();
  res.json({
    status: 'ok',
    service: 'Elevatifier Certificate Generation & Verification Engine',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatus
  });
});

// Dynamic Verification Route: /verify/:id
app.get('/verify/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'verify.html'));
});

// Public Search Portal Route: /verify
app.get('/verify', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'verify.html'));
});

// Admin Dashboard Route: /admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
});


// Fallback to index.html for unknown non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server] Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Server Initialization
async function startServer() {
  try {
    await initDb();
    
    app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`🚀 Elevatifier Monolith Server running on port ${PORT}`);
      console.log(`📍 Local URL: http://localhost:${PORT}`);
      console.log(`🛡️  Base URL:  ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
      console.log('====================================================');
      
      // Start Keep-Alive Pinger (prevents Render pod from sleeping)
      startKeepAlivePinger();
    });
  } catch (err) {
    console.error('[Server] Failed to bootstrap server:', err);
    process.exit(1);
  }
}

// Elevatifier Monolith Server Bootstrap
startServer();
