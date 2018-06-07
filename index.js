const express = require('express');
const child_process = require('child_process')
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000



app.use(cors({origin: '*', "content_security_policy": "script-src 'self' 'unsafe-eval'; object-src 'self'"}));

app.use(function(req, res, next) {
    res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-eval'; object-src 'self'");
    return next();
});

app.get('/compile', (req, res) => {  

   const code = req.query.code || '';
   PostCode({
      'input' : code,
      'action': 'cpp2wast',
      'output_info': 'compiled_code',
      'options' : '-std=c++11 -Os',
  }, chunk => {
      PostCode({
          'input' : chunk,
          'action' : 'wast2wasm',
      }, chunk => {
          let buff = new Buffer(chunk.split("-----WASM binary data\n")[1], 'base64');  
          res.send(buff);
      });
  });



});

app.listen(PORT, () => {
  console.log('Platform: ' + process.platform);
   console.log('listen: ' + PORT);
});


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