
const path = require('path')

const port = 8081
const domain = "localhost"
const protocol = "http"
const dataDir = path.join(__dirname, 'data')
const levelBaseDir = path.join(dataDir, 'levels')
const tmpDir = 'tmp'
const playlistBaseDir = path.join(dataDir, 'playlists')

exports.domain = domain
exports.protocol = protocol
exports.dataDir = dataDir
exports.levelBaseDir = levelBaseDir
exports.port = port
exports.tmpDir = tmpDir
exports.playlistBaseDir = playlistBaseDir