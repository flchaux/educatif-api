const sharp = require('sharp')
const fs = require('fs');
const path = require('path')

const { dataDir, bundleDir, srcBaseDir } = require('./constants')
const { computeFileUrl, computeUrl } = require('./utils.js').utils;
const { send } = require('process');

const worldSize = { width: 8, height: 8 }
const clientPixelsPerUnit = 100;

let connectionSize = {
    width: 36,
    height: 36
}


function getPuzzleFileName(isCorner) {
    let puzzleFile = ''
    if (isCorner.left || isCorner.right || isCorner.top || isCorner.bottom) {
        if (isCorner.top) {
            puzzleFile += 'top';
        }
        if (isCorner.bottom) {
            puzzleFile += 'bottom'
        }
        if (isCorner.left || isCorner.right) {
            if (isCorner.top || isCorner.bottom) {
                puzzleFile += '-'
            }

            if (isCorner.left) {
                puzzleFile += 'left';
            }
            if (isCorner.right) {
                puzzleFile += 'right'
            }
        }
    }
    else {
        puzzleFile = 'center'
    }
    return puzzleFile + '.png'
}

async function createPuzzleMask(finalSize, hasConnections, isCorner, dataDir, ingamePieceSize){


    let puzzle = await sharp({
        create: {
          width: Math.ceil(finalSize.width),
          height: Math.ceil(finalSize.height),
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      }).png()

    let composition = []
    let gravity = ''

    if(hasConnections.top && hasConnections.bottom && hasConnections.left && hasConnections.right){
        gravity = 'centre'
    }
    else{
        if(!hasConnections.top){
            gravity = 'north'
        }
        else if(!hasConnections.bottom){
            gravity = 'south'
        }
        
        if(!hasConnections.left){
            gravity += 'west'
        }
        else if(!hasConnections.right){
            gravity += 'east'
        }
    }

    let margin = {
        left: hasConnections.left ? connectionSize.width : 0,
        top: hasConnections.top ? connectionSize.height : 0,
    }
    
    composition.push({ input: await sharp(path.join(dataDir, 'puzzle', 'parts', 'plain.png')).resize(Math.ceil(ingamePieceSize.width), Math.ceil(ingamePieceSize.height)).toBuffer(), gravity: gravity, blend: 'source' })

    let sides = [
        { side:'left', rotation: 0, position:{
            left: 0,
            top: ingamePieceSize.height / 2 - connectionSize.height + margin.top
        }}, 
        { side:'top', rotation: 90, position:{
            left: ingamePieceSize.width / 2 - connectionSize.width + margin.left,
            top: 0
        }}, 
        { side:'right', rotation: 180, position:{
            left: finalSize.width - connectionSize.width,
            top: ingamePieceSize.height / 2 - connectionSize.height  + margin.top,
        }}, 
        { side:'bottom', rotation: 270, position:{
            left: ingamePieceSize.width / 2 - connectionSize.width + margin.left,
            top: finalSize.height - connectionSize.height,
        }}]
    console.log(sides)
    for(let side of sides){
        if(!isCorner[side.side]){
            let blend = hasConnections[side.side] ? 'over' : 'dest-out'
            let rotation = hasConnections[side.side] ? side.rotation : (side.rotation + 180) % 360
            composition.push({ 
                input: await sharp(path.join(dataDir, 'puzzle', 'parts', 'left.png')).rotate(rotation).resize({width: connectionSize.width, height: connectionSize.height, fit: 'outside'}).toBuffer(),
                blend: blend, 
                left: Math.floor(side.position.left),
                top: Math.floor(side.position.top), })
        }
    }
    
    puzzle = puzzle.composite(composition)


    return puzzle
}

async function generatePiece(level, levelName, srcDir, srcImg, puzzleSize, worldPieceSize, column, line, originalPieceSize, ingamePieceSize, hasConnections) {
    let pieceName = line + "-" + column
    let pieceFile = pieceName + ".png"

    let isCorner = {
        left: column == 0,
        top: line == 0,
        right: column == puzzleSize.width - 1,
        bottom: line == puzzleSize.height - 1,
    }

    let marginsToApply = {
        left: connectionSize.width * hasConnections.left,
        top: connectionSize.height * hasConnections.top,
        right: connectionSize.width * hasConnections.right,
        bottom: connectionSize.height * hasConnections.bottom,
    }

    let offsetToExtract = {
        left: Math.floor(column * originalPieceSize.width - marginsToApply.left),
        top: Math.floor(line * originalPieceSize.height - marginsToApply.top),
        width: Math.floor(originalPieceSize.width + marginsToApply.right + marginsToApply.left),
        height: Math.floor(originalPieceSize.height + marginsToApply.top + marginsToApply.bottom),
    };

    let worldBorderToApply = {
        left: marginsToApply.left / clientPixelsPerUnit,
        top: marginsToApply.top / clientPixelsPerUnit,
        right: marginsToApply.right / clientPixelsPerUnit,
        bottom: marginsToApply.bottom / clientPixelsPerUnit,
    }

    let finalSize = {
        width: ingamePieceSize.width + marginsToApply.left + marginsToApply.right,
        height: ingamePieceSize.height + marginsToApply.top + marginsToApply.bottom,
    }

    let worldPosition = {
        x: column * worldPieceSize.width + (worldPieceSize.width + worldBorderToApply.left + worldBorderToApply.right) / 2 - worldBorderToApply.left,
        y: line * worldPieceSize.height + (worldPieceSize.height + worldBorderToApply.top + worldBorderToApply.bottom) / 2 - worldBorderToApply.top,
    }

    let puzzle = await createPuzzleMask(finalSize, hasConnections, isCorner, dataDir, ingamePieceSize);

    puzzle.clone().toFile(path.join(srcDir, "puzzle-"+pieceFile), function (err) {
        if (err) {
            console.log(err)
        }
    })
    srcImg.clone()
        .extract(offsetToExtract)
        .resize(Math.ceil(finalSize.width), Math.ceil(finalSize.height))
        .composite([{ input: await puzzle.toBuffer(), blend: 'dest-in' }])
        .toFile(path.join(srcDir, pieceFile), function (err) {
            if (err) {
                console.log(err)
            }
        })

    level.pieces.push({
        "image": pieceFile,
        "positionX": worldPosition.x,
        // reverse y because unity use bottom to top coordinates
        "positionY": worldSize.height - worldPosition.y,
        "id": pieceName,
        "url": computeFileUrl(levelName, pieceFile)
    })
}

async function generatePuzzle(levelName, puzzleSize, srcDir, srcImg, metadata, req, res) {
    // Grid is the game area

    let level = {
        "bundle": levelName,
        "pieces": [],
        "type": "puzzle",
        "specs": {
            "size": puzzleSize
        }
    }

    const originalPieceSize = {
        width: metadata.width / puzzleSize.width,
        height: metadata.height / puzzleSize.height,
    }

    let imageRatio = originalPieceSize.width / originalPieceSize.height
    const worldPieceSize = {
        height: worldSize.height / puzzleSize.height
    }
    worldPieceSize.width = imageRatio * worldPieceSize.height

    const ingamePieceSize = {
        width: worldPieceSize.width * clientPixelsPerUnit,
        height: worldPieceSize.height * clientPixelsPerUnit
    }

    let connections = []

    for (let line = 0; line < puzzleSize.height; ++line) {
        for (let column = 0; column < puzzleSize.width; ++column) {

            let isCorner = {
                left: column == 0,
                top: line == 0,
                right: column == puzzleSize.width - 1,
                bottom: line == puzzleSize.height - 1,
            }
            let hasConnections = {
                left: !isCorner.left && !connections[line+"-"+(column-1)].right,
                top: !isCorner.top && !connections[(line-1)+"-"+column].bottom,
                right: !isCorner.right && Math.floor(Math.random() * 2) == 0,
                bottom: !isCorner.bottom && Math.floor(Math.random() * 2) == 0
            }
            connections[line+"-"+column] = hasConnections

            await generatePiece(level, levelName, srcDir, srcImg, puzzleSize, worldPieceSize, column, line, originalPieceSize, ingamePieceSize, hasConnections);
        }
    }
    let levelFile = path.join(srcDir, "level.json")
    let levelJson = JSON.stringify(level)
    fs.writeFile(levelFile, levelJson, function (error, data) {
        res.send(levelJson)
    })
}

function handleGeneratePuzzleWithExistingFile(req, res) {

    const puzzleSize = { width: req.query.width ?? 4, height: req.query.height ?? 4 }
    const imageName = req.query.level
    const levelName = `${req.query.level}-${puzzleSize.width}-${puzzleSize.height}`
    const srcDir = path.join(srcBaseDir, levelName);
    if (fs.existsSync(srcDir)) {
        fs.rmdirSync(srcDir, {
            recursive: true,
            force: true
        });
    }
    fs.mkdirSync(srcDir);
    const srcPath = path.join(srcBaseDir, imageName + ".png")
    const srcImg = sharp(srcPath)


    console.log("src file: " + srcPath);
    srcImg.metadata()
        .then(function (metadata) {
            generatePuzzle(levelName, puzzleSize, srcDir, srcImg, metadata, req, res)
        });
}

function handleGeneratePuzzle(req, res) {

    const puzzleSize = { width: req.query.width ?? 4, height: req.query.height ?? 4 }
    const imageName = req.query.level
    const levelName = `${req.query.level}-${puzzleSize.width}-${puzzleSize.height}`
    const srcDir = path.join(srcBaseDir, levelName);
    const image = req.files.image;

    if (fs.existsSync(srcDir)) {
        fs.rmdirSync(srcDir, {
            recursive: true,
            force: true
        });
    }
    fs.mkdirSync(srcDir);
    const srcPath = path.join(srcBaseDir, imageName + ".png")
    image.mv(srcPath, function (err) {
        if (err)
            return res.status(500).send(err);

        const srcImg = sharp(srcPath)
        console.log("src file: " + srcPath);
        srcImg.metadata()
            .then(function (metadata) {
                generatePuzzle(levelName, puzzleSize, srcDir, srcImg, metadata, req, res)
            });
    })
}

exports.handleGeneratePuzzle = handleGeneratePuzzle
exports.handleGeneratePuzzleWithExistingFile = handleGeneratePuzzleWithExistingFile