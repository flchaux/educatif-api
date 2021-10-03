const {domain, port, protocol, srcBaseDir} = require('./constants')
const path = require('path')

const utils = {
    computeUrl: (query) => {
        return protocol+"://"+domain+":"+port+"/"+query;
    },

    computeFileUrl: (level, file) => {
        return exports.utils.computeUrl("bundle/"+level+"/"+file)
    },


    computeFilePath: (level, file) => {
        return path.join(srcBaseDir, level, file)
    }
}

exports.utils = utils