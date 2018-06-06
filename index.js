const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000

const child_process = require('child_process')

app.get('/', (req, res) => {  
   res.send('Hello ' + process.platform);
});

app.listen(PORT, () => {
   console.log('Test ' + PORT);
});


child_process.exec('./emsdk-portable/emsdk update', function(err, data) {
        console.log(err)
        console.log(data.toString());
        child_process.exec('./emsdk-portable/emsdk install latest', function(err, data) {
        console.log(err)
        console.log(data.toString());
             child_process.exec('./emsdk-portable/emsdk activate latest', function(err, data) {
        console.log(err)
        console.log(data.toString());
child_process.exec('. ./emsdk-portable/emsdk_env.sh', function(err, data) {
            console.log(err)
        console.log(data.toString());
});
             });
        });

   });