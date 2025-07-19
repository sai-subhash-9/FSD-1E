const http = require('http');
const { URL } = require('url');
const querystring = require('querystring');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    // Serve HTML form
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <body>
          <h1>URL Parser</h1>
          <form method="POST" action="/parse">
            <label>Enter a URL:</label><br>
            <input type="text" name="url" placeholder="https://example.com/path?query=test" required style="width: 400px;">
            <br><br>
            <button type="submit">Parse URL</button>
          </form>
        </body>
      </html>
    `);
  }

  else if (req.method === 'POST' && req.url === '/parse') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString(); // Collect the POST data
    });

    req.on('end', () => {
      const { url: userUrl } = querystring.parse(body);

      let parsed;
      try {
        parsed = new URL(userUrl);
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        return res.end(`<h1>❌ Invalid URL</h1><p>${error.message}</p><a href="/">Try Again</a>`);
      }

      // Build response
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write('<html><body>');
      res.write(`<h1>Parsed Details for: ${userUrl}</h1>`);
      res.write('<ul>');
      res.write(`<li><strong>Protocol:</strong> ${parsed.protocol}</li>`);
      res.write(`<li><strong>Host:</strong> ${parsed.host}</li>`);
      res.write(`<li><strong>Hostname:</strong> ${parsed.hostname}</li>`);
      res.write(`<li><strong>Port:</strong> ${parsed.port || 'None'}</li>`);
      res.write(`<li><strong>Pathname:</strong> ${parsed.pathname}</li>`);
      res.write(`<li><strong>Search:</strong> ${parsed.search || 'None'}</li>`);
      res.write(`<li><strong>Hash:</strong> ${parsed.hash || 'None'}</li>`);
      res.write('</ul>');

      // Show query parameters if any
      res.write('<h2>Search Parameters</h2>');
      if ([...parsed.searchParams].length > 0) {
        res.write('<ul>');
        parsed.searchParams.forEach((value, key) => {
          res.write(`<li>${key} = ${value}</li>`);
        });
        res.write('</ul>');
      } else {
        res.write('<p>No search parameters</p>');
      }

      res.write('<br><a href="/">🔙 Try another URL</a>');
      res.write('</body></html>');
      res.end();
    });
  }

  else {
    // 404
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 - Not Found</h1>');
  }
});

// Important: Use dynamic port for Render
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
