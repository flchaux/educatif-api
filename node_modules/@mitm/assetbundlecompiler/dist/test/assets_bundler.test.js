"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs = require("fs-extra");
const os = require("os");
const path = require("path");
const assetsBundler = require("../src/assets_bundler");
describe('AssetsBundler', () => {
    const tmpFilePath = path.normalize(`${os.tmpdir()}/test.empty`);
    let bundler;
    before(() => fs.createFileSync(tmpFilePath));
    beforeEach(() => bundler = new assetsBundler.AssetsBundler());
    describe('#includingAssets()', () => {
        it('should take path strings or read streams', () => {
            chai_1.expect(bundler.includingAssets(tmpFilePath)).to.equal(bundler);
            chai_1.expect(bundler.includingAssets(fs.createReadStream(tmpFilePath))).to.equal(bundler);
        });
        it('should throw when passing something other than a string or read stream', () => {
            chai_1.expect(() => { bundler.includingAssets(null); }).to.throw();
            chai_1.expect(() => { bundler.includingAssets(5); }).to.throw();
            chai_1.expect(() => { bundler.includingAssets(fs.createWriteStream(tmpFilePath)); }).to.throw();
        });
    });
    describe('#targeting()', () => {
        it('should take strings', () => {
            chai_1.expect(bundler.targeting('EnumMemberName')).to.equal(bundler);
        });
        it('should throw when passing something other than a string', () => {
            chai_1.expect(() => { bundler.targeting(null); }).to.throw();
            chai_1.expect(() => { bundler.targeting(5); }).to.throw();
        });
    });
});
