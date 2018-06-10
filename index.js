const express = require('express');
const child_process = require('child_process')
const cors = require('cors');
const mustache = require('mustache');
const fs = require('fs');
const querystring = require('querystring');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({origin: '*'}));


function renderHTML(res, req, code, template) {
  if(code !== null && template !== null) {
    const output = mustache.render(template, {
      code,
      host: req.headers.host,
      protocol: req.protocol,
      source: "https://github.com/jacklehamster/webassembly",
    });
    res.setHeader('Content-Type', 'text/html');
    res.send(output);
  }
}

app.get('/', (req, res) => {
  let code = null, template = null;
  fs.readFile("code.cpp", function(err, data) {
    if (err) throw err;
    code = data.toString();
    renderHTML(res, req, code, template);
  });

  fs.readFile("index.mustache", function (err, data) {
    if (err) throw err;
    template = data.toString();
    renderHTML(res, req, code, template);
  });
});

app.get('/script.js', (req, res) => {
  fs.readFile("script.mustache", function (err, data) {
    if (err) throw err;
    const output = mustache.render(data.toString(), {
      host: req.headers.host,
      protocol: req.protocol,
    });
    res.setHeader('Content-Type', 'text/javascript');
    res.send(output);
  });
});

app.get('/compile', (req, res) => {  
   const code = req.query.code || '';
   PostCode({
      input : code,
      action: 'cpp2wast',
      options : '-std=c++11 -Os',
  }, chunk => {
      PostCode({
          input : chunk,
          action : 'wast2wasm',
      }, chunk => {
        const WASM_TAG = "-----WASM binary data\n";
        if (chunk.indexOf(WASM_TAG)=== 0) {
          let buff = new Buffer(chunk.split(WASM_TAG)[1], 'base64');  
          res.setHeader('Content-Type', 'application/wasm');
          res.send(buff);
        } else {
          res.setHeader('Content-Type', 'application/wasm');
          res.send(new Buffer(""));
        }
      });
  });
});

app.listen(PORT, () => {
   console.log('Platform: ' + process.platform);
   console.log('listen: ' + PORT);
});


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