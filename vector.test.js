const vector = require('./vector');

test('multiplyConstant', () => {
    expect(vector.multiplyConstant({ a: 12, b: 3 }, 3))
        .toEqual({ a: 36, b: 9 });
});

test('multiply', () => {
    expect(vector.multiply({ a: 12, b: 3, c: 4 }, { a: 2, b: 3, d: 6 }))
        .toEqual({ a: 24, b: 9, c: 0, d: 0 });
});

test('multiply keep values', () => {
    expect(vector.multiply({ a: 12, b: 3, c: 4 }, { a: 2, b: 3, d: 6 }, true))
        .toEqual({ a: 24, b: 9, c: 4, d: 6 });
});

test('add', () => {
    expect(vector.add({ a: 12, b: 3, c: 4 }, { a: 2, b: 3, d: 6 }))
        .toEqual({ a: 14, b: 6, c: 4, d: 6 });
});

test('translate', () => {
    expect(vector.translate({x: 12, y: 3}, {left: 3, top: 4}))
        .toEqual({ x: 15, y: 7 });
})
test('expand', () => {
    expect(vector.expand({width: 12, height: 3}, {left: 3, top: 4, right: 5, bottom: 6}))
        .toEqual({ width: 20, height: 13 });
})
test('floor', () => {
    expect(vector.floor({width: 12.1, height: 3.8}))
        .toEqual({ width: 12, height: 3 });
})
test('round', () => {
    expect(vector.round({width: 12.1, height: 3.8}))
        .toEqual({ width: 12, height: 4 });
})
test('computeBorderBounds top to bottom', () => {
    expect(vector.computeBorderBounds({width: 12.1, height: 3.8, x: 3, y: 4}))
        .toEqual({ width: 12.1, height: 3.8, x: 3, y: 4, left: -3.05, top: 2.1, right: 9.05, bottom: 5.9 });
})
test('computeBorderBounds bottom to top', () => {
    expect(vector.computeBorderBounds({width: 12.1, height: 3.8, x: 3, y: 4}, {vertical: 'bottomToTop'}))
        .toEqual({ width: 12.1, height: 3.8, x: 3, y: 4, left: -3.05, top: 5.9, right: 9.05, bottom: 2.1 });
})
test('computeCenterBounds top to bottom', () => {
    let original = {left: 5, top: 3, width: 2, height: 2}
    expect(vector.computeCenterBounds(original))
        .toEqual({ ...original, x: 6, y: 4, width: 2, height: 2 });
})
test('computeCenterBounds top to bottom', () => {
    let original = {left: 5, top: 3, right: 7, bottom: 5}
    expect(vector.computeCenterBounds(original))
        .toEqual({ ...original, x: 6, y: 4, width: 2, height: 2 });
})
test('computeCenterBounds bottom to top', () => {
    let original = {left: 5, top: 5, right: 7, bottom: 3}
    expect(vector.computeCenterBounds(original, {vertical: 'bottomToTop'}))
        .toEqual({ ...original, x: 6, y: 4, width: 2, height: 2 });
})
test('switchCoordinateSystem', () => {
    expect(vector.switchCoordinateSystem({width: 10, height: 5}, {width: 1000, height: 500}, {x: 5, y: 3, width: 2, height: 4}))
        .toEqual({ x: 500, y: 300, width: 200, height: 400 });
})
test('switchCoordinateSystem vertical switch', () => {
    expect(vector.switchCoordinateSystem({width: 10, height: 5}, {width: 1000, height: 500, vertical: 'bottomToTop'}, {x: 5, y: 3, width: 2, height: 4}))
        .toEqual({ x: 500, y: 200, width: 200, height: 400 });
})