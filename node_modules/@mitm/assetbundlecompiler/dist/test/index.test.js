"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const assetsBundler = require("../src/assets_bundler");
const index = require("../src/index");
describe('index', () => {
    describe('bundle()', () => {
        it('should return an AssetsBundler', () => {
            chai_1.expect(index.bundle()).to.be.an.instanceof(assetsBundler.AssetsBundler);
        });
    });
});
