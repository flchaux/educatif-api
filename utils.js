const {domain, port, protocol, levelBaseDir, tmpDir} = require('./constants')
const path = require('path')

const utils = {
    computeUrl: (query) => {
        return protocol+"://"+domain+":"+port+"/"+query;
    },

    computeFileUrl: (level, file) => {
        return exports.utils.computeUrl("level/"+level+"/"+file)
    },


    computeLevelFilePath: (level, file) => {
        return path.join(levelBaseDir, level, file)
    },
    
    computeTmpImagePath: (id) => {
        return path.join(tmpDir, id)
    },

}

exports.utils = utils