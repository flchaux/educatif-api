
function multiplyConstant(matrix, constant){
    let result = {}
    for(let key in matrix){
        result[key] = matrix[key] * constant
    }
    return result
}

function reverse(m){
    let result = {}
    for(let key in m){
        result[key] = 1 / m[key]
    }
    return result
}

function multiply(m1, m2, keep = false){
    let result = {}
    for(let key in m1){
        result[key] = m1[key] * (m2[key] ?? (keep ? 1 : 0))
    }
    for(let key in m2){
        if(m1[key] == undefined)
            result[key] = keep ? m2[key] : 0
    }
    return result
}

function divide(m1, m2, keep = false){
    return multiply(m1, reverse(m2), keep)
}

function add(m1, m2){
    let result = {}
    for(let key in m1){
        result[key] = m1[key] + (m2[key] ?? 0)
    }
    for(let key in m2){
        if(m1[key] == undefined)
            result[key] = m2[key]
    }
    return result
}

function translate(position, margin){
    return add(position, {
        x: margin.left,
        y: margin.top
    })
}

function expand(size, margin){
    return add(size, {
        width: margin.left + margin.right,
        height: margin.top + margin.bottom
    })
}

function floor(matrix){
    let result = {}
    for(let key in matrix){
        result[key] = Math.floor(matrix[key])
    }
    return result
}


function round(matrix){
    let result = {}
    for(let key in matrix){
        result[key] = Math.round(matrix[key])
    }
    return result
}

function computeBorderBounds(bounds, options){
    options = options || {
        vertical: 'topToBottom',
    }
    bounds.left = bounds.x - bounds.width/2
    bounds.top = bounds.y - bounds.height/2 * (options.vertical == 'topToBottom' ? 1 : -1)
    bounds.right = bounds.x + bounds.width/2
    bounds.bottom = bounds.y + bounds.height/2 * (options.vertical == 'topToBottom' ? 1 : -1)
    return bounds
}
function computeCenterBounds(bounds, options){
    options = options || {
        vertical: 'topToBottom',
    }
    bounds.width = bounds.width ?? bounds.right - bounds.left
    bounds.height = bounds.height ?? (bounds.bottom - bounds.top) * (options.vertical == 'topToBottom' ? 1 : -1)
    bounds.x = bounds.left + bounds.width/2
    bounds.y = bounds.top + bounds.height/2 * (options.vertical == 'topToBottom' ? 1 : -1)
    return bounds
}

function switchCoordinateSystem(originalSystem, destinationSystem, bounds){
    let ratio = {
        x: destinationSystem.width / originalSystem.width,
        y: destinationSystem.height / originalSystem.height,
    }
    let tempY = bounds.y * ratio.y
    
    return {
        x: bounds.x * ratio.x,
        y: (originalSystem.vertical == destinationSystem.vertical) ? tempY : destinationSystem.height - tempY,
        width: bounds.width ? bounds.width * ratio.x : undefined,
        height: bounds.height ? bounds.height * ratio.y : undefined
    }
}

exports.multiplyConstant = multiplyConstant
exports.multiply = multiply
exports.add = add
exports.translate = translate
exports.expand = expand
exports.floor = floor
exports.round = round
exports.switchCoordinateSystem = switchCoordinateSystem
exports.computeBorderBounds = computeBorderBounds
exports.computeCenterBounds = computeCenterBounds
exports.divide = divide
exports.reverse = reverse