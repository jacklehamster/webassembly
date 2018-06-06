const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000

const child_process = require('child_process')

app.get('/', (req, res) => {  

   const code = `int sum(int a, int b) {
     return a + b;
   }`;
   PostCode({
      'input' : code,
      'action': 'cpp2wast',
      'output_info': 'compiled_code',
      'options' : '-std=c++11 -Os',
  }, chunk => {
    PostCode({
        'input' : chunk,
        'action' : 'wast2assembly',
        }, chunk => {
            PostCode({
                'input' : chunk,
                'action' : 'wast2wasm',
            }, chunk => {
                  res.send(chunk);
            });
        });
   });



});

app.listen(PORT, () => {
   console.log('Test ' + PORT);
});

console.log('Platform: ' + process.platform);

// We need this to build our post string
const querystring = require('querystring');
const http = require('http');
const fs = require('fs');

function PostCode(params, callback) {
  // Build the post string from an object
  var post_data = querystring.stringify(params);

  // An object of options to indicate where to post to
  var post_options = {
      host: 'wasmexplorer-service.herokuapp.com',
      path: '/service.php',
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(post_data),
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