require('dotenv').config();
const express = require('express')
const path = require('path')
const app = express()
const fs = require('fs');
const fsPromises = require('fs').promises;
const puzzle = require('./puzzle.js')
const levelManager = require('./level.js')
const { computeTmpImagePath, computeUrl, computeFileUrl, computeLevelFilePath: computeFilePath } = require('./utils.js').utils
const { dataDir, levelBaseDir, port, tmpDir } = require('./constants')
const fileUpload = require('express-fileupload');
const {useListLevels} = require('./useListLevels');
const { randomUUID } = require('crypto');
const playlist = require('./playlist')
const https = require('https')

async function handleListLevels(req, res, filterType) {
    res.send(JSON.stringify(await useListLevels(filterType)))
}

function handleDeleteLevel(req, res){
    let srcDir = path.join(levelBaseDir, req.query.level);
    fs.rmdirSync(srcDir, {
        recursive: true,
        force: true
    });
    res.send()
}

app.use(express.json())

app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
}));

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

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

app.use('/admin', express.static(process.env.FRONT))

app.get('/level/:level', function (req, res) {
    res.sendFile(computeFilePath(req.params.level, "level.json"))
})
app.get('/level/:level/:file', function (req, res) {
    res.sendFile(computeFilePath(req.params.level, req.params.file))
})
app.get('/levels', function (req, res) {
    handleListLevels(req, res)
})
app.get('/levels/:type', function (req, res) {
    handleListLevels(req, res, req.params.type)
})
app.delete('/delete', function (req, res) {
    handleDeleteLevel(req, res)
})

app.patch('/generate/puzzle', function (req, res) {
    puzzle.handleGeneratePuzzle(req, res);
})
app.post('/generate/puzzle', function (req, res) {
    puzzle.handleGeneratePuzzle(req, res);
})
app.get('/generate/puzzle/all', function (req, res) {
    puzzle.regenerateAll(req, res);
})
app.post('/level', function (req, res) {
    levelManager.handleCreateLevel(req, res)
})
app.get('/playlist', async function (req, res) {
    res.send(JSON.stringify(await playlist.list()))
})
app.get('/playlist/:playlistName', async function (req, res) {
    res.send(JSON.stringify(await playlist.load(req.params.playlistName)))
})
app.post('/playlist/:playlistName', async function (req, res) {
    res.send(JSON.stringify(playlist.update(req.params.playlistName, req.body)))
})
app.post('/playlist', async function (req, res) {
    res.send(JSON.stringify(playlist.create(req.body.name, req.body.levels)))
})

app.delete('/playlist/:playlistName', async function (req, res) {
    try{
        playlist.delete(req.params.playlistName)
        res.send(JSON.stringify({success: true}))
    }
    catch{
        res.statusCode(400)
    }
})


app.post('/image', function (req, res) {
    const image = req.files.image;

    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir);
    }
    const id = randomUUID()
    const imagePath = computeTmpImagePath(id)
    image.mv(imagePath, function (err) {
        if (err)
            return res.status(500).send(err);
        return res.send(JSON.stringify({
            id: id
        }))
    })
})

console.log("Listen " + port);

if(process.env.PROTOCOL === 'https'){
    const privateKey = fs.readFileSync(process.env.PRIVATE_KEY, 'utf8');
    const certificate = fs.readFileSync(process.env.CERTIFICATE, 'utf8');
    const ca = fs.readFileSync(process.env.CA, 'utf8');
    const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    };

    var httpsServer = https.createServer(credentials, app);
    httpsServer.listen(port)
}
else{
    app.listen(port)
}

