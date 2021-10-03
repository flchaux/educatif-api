const sharp = require('sharp')
const fs = require('fs');
const path = require('path')

const { dataDir, bundleDir, srcBaseDir } = require('./constants')
const { computeFileUrl, computeUrl } = require('./utils.js').utils

const borders = {
    left: 23 / 120,
    top: 23 / 120,
    right: 23 / 120,
    bottom: 23 / 120
}
const worldSize = { width: 8, height: 8 }
const clientPixelsPerUnit = 100;

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

async function generatePiece(level, levelName, srcDir, srcImg, puzzleSize, worldPieceSize, column, line, originalPieceSize, defaultFinalPieceSize) {
    let pieceName = line + "-" + column
    let pieceFile = pieceName + ".png"

    let isCorner = {
        left: column == 0,
        top: line == 0,
        right: column == puzzleSize.width - 1,
        bottom: line == puzzleSize.height - 1,
    }
    let hasConnections = {
        left: !isCorner.left,
        top: !isCorner.top,
        right: false,
        bottom: false,
    }

    let borderPercentToApply = {
        left: hasConnections.left ? borders.left : 0,
        top: hasConnections.top ? borders.top : 0,
        right: hasConnections.right ? borders.right : 0,
        bottom: hasConnections.bottom ? borders.bottom : 0,
    }

    let originalBorderToApply = {
        left: Math.floor(borderPercentToApply.left * originalPieceSize.width),
        top: Math.floor(borderPercentToApply.top * originalPieceSize.height),
        right: Math.floor(borderPercentToApply.right * originalPieceSize.width),
        bottom: Math.floor(borderPercentToApply.bottom * originalPieceSize.height),
    }

    let originalOffset = {
        left: Math.floor(column * originalPieceSize.width - originalBorderToApply.left),
        top: Math.floor(line * originalPieceSize.height - originalBorderToApply.top),
        width: Math.floor(originalPieceSize.width + originalBorderToApply.right + originalBorderToApply.left),
        height: Math.floor(originalPieceSize.height + originalBorderToApply.top + originalBorderToApply.bottom),
    };


    let finalBorderToApply = {
        left: borderPercentToApply.left * defaultFinalPieceSize.width,
        top: borderPercentToApply.top * defaultFinalPieceSize.height,
        right: borderPercentToApply.right * defaultFinalPieceSize.width,
        bottom: borderPercentToApply.bottom * defaultFinalPieceSize.height,
    }

    let worldBorderToApply = {
        left: finalBorderToApply.left / clientPixelsPerUnit,
        top: finalBorderToApply.top / clientPixelsPerUnit,
        right: finalBorderToApply.right / clientPixelsPerUnit,
        bottom: finalBorderToApply.bottom / clientPixelsPerUnit,
    }

    let finalSize = {
        width: defaultFinalPieceSize.width + finalBorderToApply.left + finalBorderToApply.right,
        height: defaultFinalPieceSize.height + finalBorderToApply.top + finalBorderToApply.bottom,
    }

    let worldPosition = {
        x: column * worldPieceSize.width + (worldPieceSize.width + worldBorderToApply.left + worldBorderToApply.right) / 2 - worldBorderToApply.left,
        y: line * worldPieceSize.height + (worldPieceSize.height + worldBorderToApply.top + worldBorderToApply.bottom) / 2 - worldBorderToApply.top,
    }


    let puzzle = await sharp(path.join(dataDir, 'puzzle', getPuzzleFileName(isCorner)))
        .resize(Math.ceil(finalSize.width), Math.ceil(finalSize.height))
        .toBuffer()

    srcImg.clone()
        .extract(originalOffset)
        .resize(Math.ceil(finalSize.width), Math.ceil(finalSize.height))
        .composite([{ input: puzzle, blend: 'dest-in' }])
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
    const worldPieceSize = {
        width: worldSize.width / puzzleSize.width,
        height: worldSize.height / puzzleSize.height
    }

    const finalPieceSize = {
        width: worldPieceSize.width * clientPixelsPerUnit,
        height: worldPieceSize.height * clientPixelsPerUnit
    }

    for (let line = 0; line < puzzleSize.height; ++line) {
        for (let column = 0; column < puzzleSize.width; ++column) {
            await generatePiece(level, levelName, srcDir, srcImg, puzzleSize, worldPieceSize, column, line, originalPieceSize, finalPieceSize);
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