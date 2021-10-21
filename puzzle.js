const sharp = require('sharp')
const fs = require('fs');
const path = require('path')

const { dataDir, levelBaseDir } = require('./constants')
const { computeFileUrl } = require('./utils.js').utils;
const { useListLevels } = require('./useListLevels')

const vector = require('./vector')

const maxWorldHeight = 8
const clientPixelsPerUnit = 100;

let connectionSize = {
    width: 17,
    height: 32
}

async function createPuzzleMask(finalSize, margin, hasConnections, isCorner, plainPieceSize) {
    let puzzle = await sharp({
        create: {
            ...vector.floor(finalSize),
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
    }).png()

    let composition = []

    composition.push(
        {
            input: await sharp(path.join(dataDir, 'puzzle', 'plain.png'))
                .resize(vector.floor(plainPieceSize))
                .toBuffer(),
            left: margin.left,
            top: margin.top,
            blend: 'source'
        })

    let sides = [
        {
            side: 'left', rotation: 0, position: {
                left: 0,
                top: plainPieceSize.height / 2 - connectionSize.height / 2 + margin.top
            }
        },
        {
            side: 'top', rotation: 90, position: {
                left: plainPieceSize.width / 2 - connectionSize.height / 2 + margin.left,
                top: 0
            }
        },
        {
            side: 'right', rotation: 180, position: {
                left: finalSize.width - connectionSize.width,
                top: plainPieceSize.height / 2 - connectionSize.height / 2 + margin.top,
            }
        },
        {
            side: 'bottom', rotation: 270, position: {
                left: plainPieceSize.width / 2 - connectionSize.height / 2 + margin.left,
                top: finalSize.height - connectionSize.width,
            }
        }]
    for (let side of sides) {
        if (!isCorner[side.side]) {
            let blend = hasConnections[side.side] ? 'over' : 'dest-out'
            let rotation = hasConnections[side.side] ? side.rotation : (side.rotation + 180) % 360
            composition.push({
                input: await sharp(path.join(dataDir, 'puzzle', 'left.png')).rotate(rotation)/*.resize({ width: connectionSize.width, height: connectionSize.height, fit: 'outside' })*/.toBuffer(),
                blend: blend,
                left: Math.floor(side.position.left),
                top: Math.floor(side.position.top),
            })
        }
    }

    puzzle = puzzle.composite(composition)


    return puzzle
}
async function generatePiece(levelName, srcDir, srcImg, puzzleSize, imageSize, worldSize, column, line, plainPieceSize, hasConnections) {
    
    let pieceName = line + "-" + column
    let pieceFile = pieceName + ".png"

    let isCorner = {
        left: column == 0,
        top: line == 0,
        right: column == puzzleSize.width - 1,
        bottom: line == puzzleSize.height - 1,
    }

    let marginsToApply = vector.multiplyConstant(hasConnections, connectionSize.width)
    let finalSize = vector.expand(plainPieceSize, marginsToApply)
    let positionToExtract = {
        x: plainPieceSize.width * column,
        y: plainPieceSize.height * line
    }
    
    let offsetToExtract =  {
        ...finalSize,
        ...vector.translate(positionToExtract, vector.multiplyConstant(marginsToApply, -1))
    }
    offsetToExtract.left = offsetToExtract.x
    offsetToExtract.top = offsetToExtract.y
    delete offsetToExtract.x
    delete offsetToExtract.y

    let finalPosition = vector.computeCenterBounds(offsetToExtract)

    let worldPosition = vector.switchCoordinateSystem(imageSize, {...worldSize, vertical: 'bottomToTop'}, finalPosition,)

    let puzzle = await createPuzzleMask(finalSize, marginsToApply, hasConnections, isCorner, plainPieceSize);

    // for debugging purpose, create a puzzle file
    /*puzzle.clone().toFile(path.join(srcDir, "puzzle-" + pieceFile), function (err) {
        if (err) {
            console.log(err)
        }
    })*/

    srcImg.extract(vector.floor(offsetToExtract))
        .resize(vector.floor(finalSize))
        .composite([{ input: await puzzle.toBuffer(), blend: 'dest-in' }])
        .toFile(path.join(srcDir, pieceFile), function (err) {
            if (err) {
                console.log(err)
            }
        })

    return {
        "image": pieceFile,
        "positionX": worldPosition.x,
        // reverse y because unity use bottom to top coordinates
        "positionY": worldPosition.y,
        "id": pieceName,
        "url": computeFileUrl(levelName, pieceFile)
    }
}

async function generatePuzzle(levelName, puzzleSize, srcDir, srcImg, metadata) {
    let worldSize = {
        height: maxWorldHeight,
    }
    worldSize.width = (worldSize.height / metadata.height) * metadata.width

    let finalImageSize = vector.multiplyConstant(worldSize, clientPixelsPerUnit)
    let resizedImage = sharp(await srcImg.resize(vector.floor(finalImageSize)).toBuffer())

    const plainPieceSize = vector.multiply(finalImageSize, {
        width: 1/puzzleSize.width,
        height: 1/puzzleSize.height,
    })
    let connections = []
    let pieces = []

    let currentPosition = { x: 0, y: 0 }

    for (let line = 0; line < puzzleSize.height; ++line) {
        currentPosition.x = 0
        for (let column = 0; column < puzzleSize.width; ++column) {

            let isCorner = {
                left: column == 0,
                top: line == 0,
                right: column == puzzleSize.width - 1,
                bottom: line == puzzleSize.height - 1,
            }
            let hasConnections = {
                left: !isCorner.left && !connections[line + "-" + (column - 1)].right,
                top: !isCorner.top && !connections[(line - 1) + "-" + column].bottom,
                right: !isCorner.right && Math.floor(Math.random() * 2) == 0,
                bottom: !isCorner.bottom && Math.floor(Math.random() * 2) == 0
            }
            connections[line + "-" + column] = hasConnections
            pieces.push(await generatePiece(levelName, srcDir, resizedImage.clone(), puzzleSize, finalImageSize, worldSize, column, line, plainPieceSize, hasConnections));
            currentPosition.x += plainPieceSize.width
        }
        currentPosition.y += plainPieceSize.height
    }

    let level = {
        name: levelName,
        type: "puzzle",
        pieces: pieces,
        size: {
            width: worldSize.width,
            height: worldSize.height
        },
        specs: {
            "size": puzzleSize,
        }
    }
    let levelFile = path.join(srcDir, "level.json")
    fs.writeFileSync(levelFile, JSON.stringify(level))
    return level
}


function regenerateAll(req, res) {
    useListLevels().then(async function (levelDescriptions) {
        let levels = []
        for (let levelDescription of levelDescriptions) {
            try {
                const srcPath = path.join(levelBaseDir, levelDescription.name + ".png")
                const srcDir = path.join(levelBaseDir, levelDescription.name);
                const srcImg = sharp(srcPath)
                console.log("src file: " + srcPath);
                let metadata = await srcImg.metadata()
                let level = await generatePuzzle(levelDescription.name, levelDescription.specs.size, srcDir, srcImg, metadata)
                levels.push(level)
            }
            catch (e) {
                console.log(e)
            }
        }
        res.send(JSON.stringify(levels))
    })

}

function handleGeneratePuzzleWithExistingFile(req, res) {

    const puzzleSize = { width: req.query.width ?? 4, height: req.query.height ?? 4 }
    const imageName = req.query.level
    const levelName = `${req.query.level}`
    const srcDir = path.join(levelBaseDir, levelName);
    const srcPath = path.join(srcDir, "src.png")
    const srcImg = sharp(srcPath)


    console.log("src file: " + srcPath);
    srcImg.metadata()
        .then(function (metadata) {
            generatePuzzle(levelName, puzzleSize, srcDir, srcImg, metadata, req, res).then((level) => {
                res.send(JSON.stringify(level))
            })
        });
}

function handleGeneratePuzzle(req, res) {

    const puzzleSize = { width: req.query.width ?? 4, height: req.query.height ?? 4 }
    const imageName = req.query.level
    const levelName = `${req.query.level}`
    const srcDir = path.join(levelBaseDir, levelName);
    const image = req.files.image;

    if (fs.existsSync(srcDir)) {
        fs.rmdirSync(srcDir, {
            recursive: true,
            force: true
        });
    }
    fs.mkdirSync(srcDir);
    const srcPath = path.join(srcDir, "src.png")
    image.mv(srcPath, function (err) {
        if (err)
            return res.status(500).send(err);

        const srcImg = sharp(srcPath).png()
        console.log("src file: " + srcPath);
        srcImg.metadata().then((metadata) => {
            generatePuzzle(levelName, puzzleSize, srcDir, srcImg, metadata).then((level) => {
                res.send(JSON.stringify(level))
            })
        })
    })
}

exports.handleGeneratePuzzle = handleGeneratePuzzle
exports.handleGeneratePuzzleWithExistingFile = handleGeneratePuzzleWithExistingFile
exports.regenerateAll = regenerateAll