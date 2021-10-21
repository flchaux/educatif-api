const path = require('path')
const fsPromises = require('fs').promises;
const {  computeFileUrl, computeLevelFilePath: computeFilePath } = require('./utils.js').utils
const { levelBaseDir } = require('./constants')


async function useListLevels(filterType) {
    let files = await fsPromises.readdir(levelBaseDir)
    let levels = []
    for (let file of files) {
        let p = path.join(levelBaseDir, file)
        let stats = await fsPromises.stat(p);
        if (stats.isDirectory()) {
            let text = await fsPromises.readFile(computeFilePath(file, "level.json"));
            const data = JSON.parse(text)
            type = data.type
            if (filterType == null || filterType === type) {
                levels.push({
                    "name": file,
                    "url": computeFileUrl(file, "level.json"),
                    "type": type,
                    "specs": data.specs
                })
            }
        }
    }
    return levels
}

exports.useListLevels = useListLevels