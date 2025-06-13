var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World MCP Server\n');
}).listen(1337);
console.log('Node JS Server is running on 1337');