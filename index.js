const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000

const child_process = require('child_process')

app.get('/', (req, res) => {  

   PostCode(`void sum(int a, int b) {
     return a + b;
   }`, chunk => {
      res.send('Hello ' + process.platform);
      res.send(chunk);
   });



});

app.listen(PORT, () => {
   console.log('Test ' + PORT);
});


// We need this to build our post string
const querystring = require('querystring');
const http = require('http');
const fs = require('fs');

function PostCode(codestring, callback) {
  // Build the post string from an object
  var post_data = querystring.stringify({
      'input' : codestring,
      'action': 'cpp2wast',
      'output_info': 'compiled_code',
      'options' : '-std=c++11 -Os',
  });

  // An object of options to indicate where to post to
  var post_options = {
      host: 'wasmexplorer-service.herokuapp.com',
      port: 443,
      path: 'service.php',
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(post_data),
          'Origin': 'https://mbebenita.github.io',
          'Referer': 'https://mbebenita.github.io/WasmExplorer/',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36',
      }
  };

  // Set up the request
  var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', callback);
  });

  // post the data
  post_req.write(post_data);
  post_req.end();

}