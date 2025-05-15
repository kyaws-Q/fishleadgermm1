const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['X-Requested-With', 'Content-Type', 'Authorization', 'apikey', 'x-client-info']
}));

// Proxy requests to Supabase
app.use('/supabase', createProxyMiddleware({
  target: 'https://okzcrijmvpwouqemvzat.supabase.co',
  changeOrigin: true,
  pathRewrite: {
    '^/supabase': ''
  },
  onProxyReq: (proxyReq) => {
    // Add the Supabase API key to all requests
    proxyReq.setHeader('apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9remNyaWptdnB3b3VxZW12emF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMjY3MzEsImV4cCI6MjA2MTYwMjczMX0.r24vEIhvJA2uRyLTbZCGr2jpphYSS-qjG3zZ42ntpFQ');
    proxyReq.setHeader('x-client-info', 'supabase-js/2.x');
  }
}));

// Start the server
app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});
