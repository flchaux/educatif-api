
const path = require('path')

const port = 8081
const domain = "localhost"
const protocol = "http"
const dataDir = path.join(__dirname, 'data/')
const bundleDir = path.join(dataDir, 'bundle/')
const srcBaseDir = path.join(dataDir, 'src/')

//exports = { ...exports, domain, protocol, dataDir, bundleDir, srcBaseDir }
exports.domain = domain
exports.protocol = protocol
exports.dataDir = dataDir
exports.bundleDir = bundleDir
exports.srcBaseDir = srcBaseDir
exports.port = port