const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8081;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head><title>404 - File Not Found</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1>🔍 File Not Found</h1>
              <p>The file <code>${req.url}</code> was not found.</p>
              <h3>Available files:</h3>
              <div style="margin: 20px;">
                <a href="/index.html" style="display: inline-block; margin: 10px; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px;">📱 Mobile App</a>
                <a href="/mobile.html" style="display: inline-block; margin: 10px; padding: 10px 20px; background: #16a34a; color: white; text-decoration: none; border-radius: 5px;">🚀 Demo Page</a>
              </div>
            </body>
          </html>
        `);
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SoulConnect Server running at:`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://192.168.79.8:${PORT}`);
  console.log(`   Mobile:  http://192.168.79.8:${PORT}/index.html`);
  console.log('');
  console.log('✅ Ready for mobile access!');
});
