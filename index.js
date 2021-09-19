const express = require('express')
const path = require('path')
const app = express()
const sharp = require('sharp')
const port = 8081
const fs = require('fs');
const { BuildTargets, bundle, setUnityPath } = require('@mitm/assetbundlecompiler');
//import { BuildTargets, bundle } from '@mitm/assetbundlecompiler';

const { WebGL } = BuildTargets;

const dataDir = path.join(__dirname, 'data/');
const bundleDir = path.join(dataDir, 'bundle/');
const srcBaseDir = path.join(dataDir, 'src/');
const domain = "localhost";
const protocol = "http"

function computeFilePath(level, file){
    return path.join(srcBaseDir, level, file)
}
function computeFileUrl(level, file){
    return protocol+"://"+domain+":"+port+"/bundle/"+level+"/"+file;
}

app.get('/bundle', function(req, res){
    res.sendFile(path.join(bundleDir, req.query.level))
})
app.get('/bundle/:level/:file', function(req, res){
    res.sendFile(computeFilePath(req.params.level, req.params.file))
})
app.get('/generate/puzzle', function(req, res){
    const levelName = req.query.level
    const srcDir = path.join(srcBaseDir, levelName);
    if (fs.existsSync(srcDir)){
        fs.rmdirSync(srcDir, {
            recursive: true,
            force: true
          });
    }
    fs.mkdirSync(srcDir);
    const srcPath = path.join(srcBaseDir, levelName + ".png")
    const srcImg = sharp(srcPath)

    const puzzleSize = { width: req.query.width ?? 4, height: req.query.height ?? 4 }
    // Grid is the game area
    const gridSize = { width: 8, height: 8 }
    const clientPixelsPerUnit = 100;

    let level = {
        "bundle": levelName,
        "pieces": []
    }

    console.log("src file: "+srcPath);
    srcImg.metadata()
    .then(function(metadata) {
        const originalPieceSize = {
            width: metadata.width / puzzleSize.width,
            height: metadata.height / puzzleSize.height,
        }
        const cellSize = {
            width: gridSize.width / puzzleSize.width, 
            height: gridSize.height / puzzleSize.height 
        }
        const pxGridSize = {
            width: 1000,
            height: 1000
        }

        const finalPieceSize = {
            width: cellSize.width * clientPixelsPerUnit,
            height: cellSize.height * clientPixelsPerUnit
        }

        let bundleFiles = []

        for(let y = 0; y < puzzleSize.width; ++y){
            for(let x = 0; x < puzzleSize.height; ++x){
                let pieceName =  x+"-"+y
                let pieceFile =  pieceName+".png"
                srcImg.clone().extract({ 
                    left: x*originalPieceSize.width,
                    top: y*originalPieceSize.height,
                    width: originalPieceSize.width,
                    height: originalPieceSize.height 
                })
                .resize(Math.ceil(finalPieceSize.width), Math.ceil(finalPieceSize.height))
                .toFile(path.join(srcDir, pieceFile), function(err) {
                })
                level.pieces.push({
                    "image": pieceFile,
                    "positionX": x * cellSize.width,
                    // reverse y because unity use bottom to top coordinates
                    "positionY": (puzzleSize.height - y) * cellSize.height,
                    "id": pieceName,
                    "url": computeFileUrl(levelName, pieceFile)
                })
                bundleFiles.push(path.join(srcDir, pieceFile))
            }
        }
        let levelFile = path.join(srcDir, "level.json")
        let levelJson = JSON.stringify(level)
        fs.writeFile(levelFile, levelJson, function(error, data){

            bundleFiles.push(levelFile)
            /*setUnityPath("C:\\Program Files\\Unity\\Hub\\Editor\\2020.3.6f1\\Editor\\Unity.exe")
            bundle(...bundleFiles)
                // .targeting() is mandatory and tells the library what platform your asset bundle targets.
                // You can either pass a predefined constant in BuildTargets, or a string,
                // matching the name of a member of the UnityEditor.BuildTarget enum.
                // @see https://docs.unity3d.com/ScriptReference/BuildTarget.html
                .targeting(WebGL)
                
                // This lets you define a simple logger to get simple text updates about the conversion.
                .withLogger(message => console.log(message))
                
                // This lets you define a logger for the real-time output of Unity (stdout+stderr).
                // Beware, it's very verbose :)
                .withUnityLogger(message => console.log(`Unity: ${message}`))
                
                // This is the "run" function and marks the termination of the fluent calls
                // by returning a Promise that resolves when the asset bundle generation ends.
                // Give it a path to the asset bundle name or a fs.WriteStream.
                .to(path.join(bundleDir, levelName))
                .then(function(){

                    res.send('{"status": "ok"}')
                });*/
            res.send(levelJson)
        })
    });

})

console.log("Listen "+port);

app.listen(port)
