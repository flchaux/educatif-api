const express = require('express')
const path = require('path')
const fs = require('fs');
const fsPromises = require('fs').promises;
const { computeTmpImagePath, computeFileUrl, computeLevelFilePath: computeFilePath } = require('./utils.js').utils
const { levelBaseDir } = require('./constants')
const sharp = require('sharp')
const vector = require('./vector')

const clientPixelsPerUnit = 100

const worldSize = {
    width: 22,
    height: 10
}

const webAreaSize = {
    width: 1100,
    height: 500
}

function computePieceWorldPosition(position, pieceSize, sizeRatio) {
    let bounds = vector.computeCenterBounds({
        left: position.x,
        top: position.y,
        ...(vector.multiplyConstant(pieceSize, sizeRatio)),
    })
    const { x, y } = vector.switchCoordinateSystem(webAreaSize, { ...worldSize, vertical: 'bottomToTop' }, bounds)
    return { x, y }
}

async function createPiece(levelName, piece) {
    let image
    let toDelete = []
    if (piece.imageId) {
        image = sharp(computeTmpImagePath(piece.imageId))
    }
    else if (piece.imageSrc) {
        let oldImgPath = computeFilePath(levelName, piece.imageSrc + ".old")
        fs.copyFileSync(computeFilePath(levelName, piece.imageSrc), oldImgPath)
        image = sharp(oldImgPath)
        toDelete.push(oldImgPath)
    }
    const sizeRatio = webAreaSize.width / (clientPixelsPerUnit * worldSize.width)
    let metadata = await image.metadata()
    let destinationFileName = piece.id + ".png"
    let pieceFile = computeFilePath(levelName, destinationFileName)
    let pieceSize = vector.multiplyConstant({ width: metadata.width, height: metadata.height }, piece.scale)
    await image.resize(vector.floor(pieceSize))
        .toFile(pieceFile)
    for (let path of toDelete) {
        fs.rmSync(path)
    }

    let initialPosition = computePieceWorldPosition(piece.initialPosition, pieceSize, sizeRatio)
    let validPosition = null
    if (piece.validPosition) {
        validPosition = computePieceWorldPosition(piece.validPosition, pieceSize, sizeRatio)
    }

    return {
        image: destinationFileName,
        initialPosition,
        validPosition,
        id: piece.id,
        url: computeFileUrl(levelName, destinationFileName)
    }
}

function initLevel(levelName, replace) {
    const srcDir = path.join(levelBaseDir, levelName);

    if (fs.existsSync(srcDir)) {
        if (replace) {
            fs.rmdirSync(srcDir, {
                recursive: true,
                force: true
            });
        }
    }
    else {
        fs.mkdirSync(srcDir);
    }
}

async function loadLevel(levelName){
    return JSON.parse(await fsPromises.readFile(computeFilePath(levelName, "level.json")));
}

function exists(levelName){
    return fs.existsSync(path.join(levelBaseDir, levelName))
}

async function createLevel(levelName, type, pieces, size, hasBackground, specs) {

    const srcDir = path.join(levelBaseDir, levelName);
    let level = {
        name: levelName,
        type: type,
        size: size,
        pieces: pieces,
        ...(specs && { specs }),
        ...(
            hasBackground && {
                background: {
                    image: 'background.png',
                    url: computeFileUrl(levelName, 'background.png')
                }
            }
        )
    }
    let levelFile = path.join(srcDir, "level.json")
    fs.writeFileSync(levelFile, JSON.stringify(level))
    return level
}

async function createBasicLevel(levelName, inputPieces, background) {
    let hasBackground
    if(!exists(levelName)){
        initLevel(levelName, false)
    }
    else{
        hasBackground = true
    }

    const srcDir = path.join(levelBaseDir, levelName);
    let backgroundPath = path.join(srcDir, "background.png")
    if (background.imageId) {
        await sharp(computeTmpImagePath(background.imageId))
            .resize({ width: clientPixelsPerUnit * worldSize.width, height: clientPixelsPerUnit * worldSize.height, options: { fit: 'outside' } })
            .png().toFile(backgroundPath)
        hasBackground = true
    }

    let pieces = []
    for (let p of inputPieces) {
        pieces.push(await createPiece(levelName, p))
    }
    return createLevel(levelName, "basic", pieces, worldSize, hasBackground)
}

function handleCreateLevel(req, res) {
    createBasicLevel(req.body.name, req.body.pieces, req.body.background).then((level) => {
        res.send({ status: 'success', level: level })
    })
}

exports.handleCreateLevel = handleCreateLevel