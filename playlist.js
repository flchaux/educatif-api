const playlist = require('./playlist')
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path')
const { playlistBaseDir } = require('./constants')
const { computeFileUrl } = require('./utils.js').utils;

exports.load = async function(name){
    let text = await fsPromises.readFile(exports.computePlaylistPath(name));
    return JSON.parse(text)
}
exports.create = function(name, levels){
    const playlist = {
        name,
        levels
    }
    fs.writeFileSync(exports.computePlaylistPath(name), JSON.stringify(playlist))
    return playlist
}
exports.update = function(name, playlist){
    return exports.create(name, playlist.levels)
}
exports.delete = function(name){
    fs.rmSync(exports.computePlaylistPath(name))
}
exports.computePlaylistPath = function(name){
    return path.join(playlistBaseDir, name+".json")
}
exports.list = async function() {
    let files = await fsPromises.readdir(playlistBaseDir)
    let playlists = []
    for (let file of files) {
        let filepath = path.join(playlistBaseDir, file)
        let text = await fsPromises.readFile(filepath);
        const data = JSON.parse(text)
        playlists.push(data)
    }
    return playlists
}