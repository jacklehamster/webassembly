const express = require('express');
const child_process = require('child_process')
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({origin: '*'}));

app.get('/', (req, res) => {
  const script = `
    Hello, this is a tool for compiling WebAssembly

    <script src="https://${req.headers.host}/script.js">

    <script>
      function add(a, b, callback) {
          compile(\`
            export "C" {  double add(double a, double b); }
            double add(double a, double b) {
              return a + b;
            }
          \`, export => {
            callback(export.add(a, b));
          });
      }

      add(11.05, 5.5, console.log);
    </script>
  `;

  res.setHeader('Content-Type', 'text/plain');
  res.send(script);
});

app.get('/script.js', (req, res) => {
  res.setHeader('Content-Type', 'text/javascript');
  const script = `
    function compile(code, callback) {
      const obj = {};
      const url = 'https://${req.headers.host}/compile?code=';
      WebAssembly.instantiateStreaming(fetch(url + encodeURIComponent(code)), {})
        .then(({instance}) => {
          for(let i in instance.exports) {
            obj[i] = instance.exports[i];
          }
          callback(obj);
        });
      return obj;
    }
  `;
  res.send(script);
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
          res.setHeader('Content-Type', 'application/wasm');
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