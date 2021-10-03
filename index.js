const express = require('express')
const path = require('path')
const app = express()
const fs = require('fs');
const fsPromises = require('fs').promises;
const puzzle = require('./puzzle.js')
const { computeUrl, computeFileUrl, computeFilePath } = require('./utils.js').utils
const { dataDir, bundleDir, srcBaseDir, port } = require('./constants')
const fileUpload = require('express-fileupload');



async function listBundles(req, res, filterType) {
    let files = await fsPromises.readdir(srcBaseDir)
    let bundles = []
    let i = 0
    for (let file of files) {
        let p = path.join(srcBaseDir, file)
        let stats = await fsPromises.stat(p);
        if (stats.isDirectory()) {
            let text = await fsPromises.readFile(computeFilePath(file, "level.json"));
            const data = JSON.parse(text)
            type = data.type
            if (filterType == null || filterType === type) {
                bundles.push({
                    "bundle": file,
                    "url": computeFileUrl(file, "level.json"),
                    "type": type
                })
            }
        }
    }
    res.send(JSON.stringify(bundles))
}

app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
}));

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.get('/bundle', function (req, res) {
    res.sendFile(path.join(bundleDir, req.query.level))
})
app.get('/bundle/:level', function (req, res) {
    res.sendFile(computeFilePath(req.params.level, "level.json"))
})
app.get('/bundle/:level/:file', function (req, res) {
    res.sendFile(computeFilePath(req.params.level, req.params.file))
})
app.get('/bundles', function (req, res) {
    listBundles(req, res)
})
app.get('/bundles/:type', function (req, res) {
    listBundles(req, res, req.params.type)
})

app.get('/generate/puzzle', function (req, res) {
    puzzle.handleGeneratePuzzleWithExistingFile(req, res);
})
app.post('/generate/puzzle', function (req, res) {
    puzzle.handleGeneratePuzzle(req, res);
})

console.log("Listen " + port);

app.listen(port)
