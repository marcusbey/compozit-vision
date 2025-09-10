// Local development server for Vercel functions
const http = require('http');
const { parse } = require('url');

// Import your serverless functions
const analyzeContext = require('./api/gemini/analyze-context');
const optimizePrompt = require('./api/gemini/optimize-prompt');
const refinePrompt = require('./api/gemini/refine-prompt');

// Map routes to functions
const routes = {
  '/api/gemini/analyze-context': analyzeContext,
  '/api/gemini/optimize-prompt': optimizePrompt,
  '/api/gemini/refine-prompt': refinePrompt,
};

// Create server
const server = http.createServer(async (req, res) => {
  const { pathname } = parse(req.url, true);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }
  
  // Find matching route
  const handler = routes[pathname];
  
  if (handler) {
    // Parse body for POST requests
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        try {
          req.body = JSON.parse(body);
        } catch (e) {
          req.body = {};
        }
        
        // Call the serverless function
        await handler(req, res);
      });
    } else {
      await handler(req, res);
    }
  } else {
    res.statusCode = 404;
    res.end('Not found');
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
  console.log('\nAvailable endpoints:');
  console.log('  POST http://localhost:' + PORT + '/api/gemini/analyze-context');
  console.log('  POST http://localhost:' + PORT + '/api/gemini/optimize-prompt');
  console.log('  POST http://localhost:' + PORT + '/api/gemini/refine-prompt');
  console.log('\n✨ Ready for requests!');
});