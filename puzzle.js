const sharp = require('sharp')
const fs = require('fs');
const path = require('path')

const { dataDir, levelBaseDir } = require('./constants')
const { computeFileUrl } = require('./utils.js').utils;
const { useListLevels } = require('./useListLevels')

const vector = require('./vector')

const maxWorldHeight = 8
const clientPixelsPerUnit = 100;
const backgroundWorldSize = { width: 22, height: 10 }

let connectionSize = {
    width: 17,
    height: 32
}

function getFiles(name) {
    return {
        image: path.join(levelBaseDir, name, 'src.png'),
        background: path.join(levelBaseDir, name, 'background.png'),
    }
}

const puzzleManager = {
    worldSize: { width: 0, height: 0 },
    levelName: '',
    srcDir: '',
    puzzleSize: { width: 0, height: 0 },
    plainPieceSize: { width: 0, height: 0 },
    createPuzzleMask: async function (finalSize, margin, hasConnections, isCorner) {
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
                    .resize(vector.floor(this.plainPieceSize))
                    .toBuffer(),
                left: margin.left,
                top: margin.top,
                blend: 'source'
            })

        let sides = [
            {
                side: 'left', rotation: 0, position: {
                    left: 0,
                    top: this.plainPieceSize.height / 2 - connectionSize.height / 2 + margin.top
                }
            },
            {
                side: 'top', rotation: 90, position: {
                    left: this.plainPieceSize.width / 2 - connectionSize.height / 2 + margin.left,
                    top: 0
                }
            },
            {
                side: 'right', rotation: 180, position: {
                    left: finalSize.width - connectionSize.width,
                    top: this.plainPieceSize.height / 2 - connectionSize.height / 2 + margin.top,
                }
            },
            {
                side: 'bottom', rotation: 270, position: {
                    left: this.plainPieceSize.width / 2 - connectionSize.height / 2 + margin.left,
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
    },
    generatePiece: async function (srcImg, column, line, hasConnections) {

        let pieceName = line + "-" + column
        let pieceFile = pieceName + ".png"

        let isCorner = {
            left: column == 0,
            top: line == 0,
            right: column == this.puzzleSize.width - 1,
            bottom: line == this.puzzleSize.height - 1,
        }

        let marginsToApply = vector.multiplyConstant(hasConnections, connectionSize.width)
        let finalSize = vector.expand(this.plainPieceSize, marginsToApply)
        let positionToExtract = {
            x: this.plainPieceSize.width * column,
            y: this.plainPieceSize.height * line
        }

        let offsetToExtract = {
            ...finalSize,
            ...vector.translate(positionToExtract, vector.multiplyConstant(marginsToApply, -1))
        }
        offsetToExtract.left = offsetToExtract.x
        offsetToExtract.top = offsetToExtract.y
        delete offsetToExtract.x
        delete offsetToExtract.y

        let finalPosition = vector.computeCenterBounds(offsetToExtract)

        let worldPosition = vector.switchCoordinateSystem(this.imageSize, { ...this.worldSize, vertical: 'bottomToTop' }, finalPosition,)

        let puzzle = await this.createPuzzleMask(finalSize, marginsToApply, hasConnections, isCorner);

        // for debugging purpose, create a puzzle file
        /*puzzle.clone().toFile(path.join(srcDir, "puzzle-" + pieceFile), function (err) {
            if (err) {
                console.log(err)
            }
        })*/

        srcImg.extract(vector.floor(offsetToExtract))
            .resize(vector.floor(finalSize))
            .composite([{ input: await puzzle.toBuffer(), blend: 'dest-in' }])
            .toFile(path.join(this.srcDir, pieceFile), function (err) {
                if (err) {
                    console.log(err)
                }
            })
        let validPosition = { x: worldPosition.x, y: worldPosition.y }

        return {
            "image": pieceFile,
            validPosition,
            "id": pieceName,
            "url": computeFileUrl(this.levelName, pieceFile)
        }
    },
    generatePiecePosition: async function (line, column, srcImage) {
        let isCorner = {
            left: column == 0,
            top: line == 0,
            right: column == this.puzzleSize.width - 1,
            bottom: line == this.puzzleSize.height - 1,
        }
        let hasConnections = {
            left: !isCorner.left && !this.connections[line + "-" + (column - 1)].right,
            top: !isCorner.top && !this.connections[(line - 1) + "-" + column].bottom,
            right: !isCorner.right && Math.floor(Math.random() * 2) == 0,
            bottom: !isCorner.bottom && Math.floor(Math.random() * 2) == 0
        }
        this.connections[line + "-" + column] = hasConnections
        return this.generatePiece(srcImage.clone(), column, line, hasConnections)
    },
    generatePuzzle: async function (levelName, puzzleSize, srcDir) {
        this.puzzleSize = puzzleSize
        this.srcDir = srcDir
        this.levelName = levelName
        this.srcImage = sharp(getFiles(levelName).image)
        let metadata = await this.srcImage.metadata()
        this.imageSize = {
            width: metadata.width,
            height: metadata.height
        }
        let hasBackground = fs.existsSync(getFiles(levelName).background)

        this.worldSize = {
            height: maxWorldHeight,
        }
        this.worldSize.width = (this.worldSize.height / this.imageSize.height) * this.imageSize.width

        this.plainPieceSize = vector.divide(this.imageSize, this.puzzleSize)
        this.connections = []
        let pieces = []

        for (let line = 0; line < this.puzzleSize.height; ++line) {
            for (let column = 0; column < this.puzzleSize.width; ++column) {
                pieces.push(await this.generatePiecePosition(line, column, this.srcImage));
            }
        }

        let level = {
            name: this.levelName,
            type: "puzzle",
            pieces: pieces,
            size: {
                width: this.worldSize.width,
                height: this.worldSize.height
            },
            specs: {
                size: this.puzzleSize,
                src: {
                    image: "src.png",
                    url: computeFileUrl(this.levelName, 'src.png')
                }
            },
            ...(
                hasBackground && {
                    background: {
                        image: 'background.png',
                        url: computeFileUrl(this.levelName, 'background.png')
                    }
                }
            )
        }
        let levelFile = path.join(this.srcDir, "level.json")
        fs.writeFileSync(levelFile, JSON.stringify(level))
        return level
    }
}

async function createOrEditPuzzle(levelName, srcDir, puzzleSize, image, background) {
    if (!fs.existsSync(srcDir)) {
        fs.mkdirSync(srcDir);
    }

    const srcPath = getFiles(levelName).image
    if (image) {
        await sharp(image.data)
            .resize({ height: maxWorldHeight * clientPixelsPerUnit })
            .png().toFile(srcPath)
    }

    const backgroundPath = getFiles(levelName).background
    if (background) {
        await sharp(background.data)
            .resize({ width: clientPixelsPerUnit * backgroundWorldSize.width, height: clientPixelsPerUnit * backgroundWorldSize.height, options: { fit: 'outside' } })
            .png().toFile(backgroundPath)
    }

    return await puzzleManager.generatePuzzle(levelName, puzzleSize, srcDir);
}

function regenerateAll(req, res) {
    useListLevels().then(async function (levelDescriptions) {
        let levels = []
        for (let levelDescription of levelDescriptions) {
            try {
                const srcDir = path.join(levelBaseDir, levelDescription.name);
                let level = await puzzleManager.generatePuzzle(levelDescription.name, levelDescription.specs.size, srcDir)
                levels.push(level)
            }
            catch (e) {
                console.log(e)
            }
        }
        res.send(JSON.stringify(levels))
    })

}

function handleGeneratePuzzle(req, res) {
    const puzzleSize = { width: req.query.width ?? 4, height: req.query.height ?? 4 }
    const levelName = `${req.query.level}`
    const srcDir = path.join(levelBaseDir, levelName);
    const image = req.files?.image;
    const background = req.files?.background;
    createOrEditPuzzle(levelName, srcDir, puzzleSize, image, background).then((level) => {
        res.send(JSON.stringify(level))
    })
}

exports.handleGeneratePuzzle = handleGeneratePuzzle
exports.regenerateAll = regenerateAll