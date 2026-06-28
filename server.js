/* Tiny zero-dependency static server for the Red 5 website.
   Run:  node server.js     then open  http://localhost:5500
   (You can also just double-click index.html — the site works offline too.) */
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = process.env.PORT || 5500;
const types = {
  ".html":"text/html; charset=utf-8", ".css":"text/css", ".js":"text/javascript",
  ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".gif":"image/gif",
  ".webp":"image/webp", ".svg":"image/svg+xml", ".ico":"image/x-icon", ".json":"application/json",
  ".woff":"font/woff", ".woff2":"font/woff2"
};

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  let file = path.normalize(path.join(root, p));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end("Forbidden"); }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      return res.end("<h1>404 — page not found</h1><p><a href='/'>Back to Red 5 home</a></p>");
    }
    res.writeHead(200, {
      "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache, no-store, must-revalidate"
    });
    res.end(data);
  });
}).listen(port, () => console.log("Red 5 website running at  http://localhost:" + port));
