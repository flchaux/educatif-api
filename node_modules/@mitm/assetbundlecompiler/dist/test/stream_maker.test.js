"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs = require("fs-extra");
const os = require("os");
const path = require("path");
const streamMaker = require("../src/stream_maker");
describe('stream_maker', () => {
    const tmpFilePath = path.normalize(`${os.tmpdir()}/test.empty`);
    describe('isWriteStream()', () => {
        it('should recognize WriteStreams', () => {
            const stream = fs.createWriteStream(tmpFilePath);
            chai_1.expect(streamMaker.isWriteStream(stream)).to.be.true;
        });
        it('should return false for non-WriteStreams', () => {
            const stream = fs.createReadStream(tmpFilePath);
            chai_1.expect(streamMaker.isWriteStream(stream)).to.be.false;
            chai_1.expect(streamMaker.isWriteStream(null)).to.be.false;
        });
    });
    describe('isReadStream()', () => {
        it('should recognize ReadStreams', () => {
            const stream = fs.createReadStream(tmpFilePath);
            chai_1.expect(streamMaker.isReadStream(stream)).to.be.true;
        });
        it('should return false for non-ReadStreams', () => {
            const stream = fs.createWriteStream(tmpFilePath);
            chai_1.expect(streamMaker.isReadStream(stream)).to.be.false;
            chai_1.expect(streamMaker.isReadStream(null)).to.be.false;
        });
    });
    describe('normalizeWriteStream()', () => {
        it('should convert paths to write streams', () => {
            const stream = streamMaker.normalizeWriteStream(tmpFilePath);
            chai_1.expect(streamMaker.isWriteStream(stream)).to.be.true;
        });
        it('should return write streams as-is', () => {
            const stream = fs.createWriteStream(tmpFilePath);
            chai_1.expect(streamMaker.normalizeWriteStream(stream)).to.equal(stream);
        });
        it('should throw when encountering something other than a string or write stream', () => {
            chai_1.expect(() => { streamMaker.normalizeWriteStream(null); }).to.throw();
            chai_1.expect(() => { streamMaker.normalizeWriteStream(42); }).to.throw();
            chai_1.expect(() => { streamMaker.normalizeWriteStream(String); }).to.throw();
        });
    });
    describe('normalizeReadStream()', () => {
        it('should convert paths to read streams', () => {
            const stream = streamMaker.normalizeReadStream(tmpFilePath);
            chai_1.expect(streamMaker.isReadStream(stream)).to.be.true;
        });
        it('should return read streams as-is', () => {
            const stream = fs.createReadStream(tmpFilePath);
            chai_1.expect(streamMaker.normalizeReadStream(stream)).to.equal(stream);
        });
        it('should throw when encountering something other than a string or read stream', () => {
            chai_1.expect(() => { streamMaker.normalizeReadStream(null); }).to.throw();
            chai_1.expect(() => { streamMaker.normalizeReadStream(42); }).to.throw();
            chai_1.expect(() => { streamMaker.normalizeReadStream(String); }).to.throw();
        });
    });
    after(() => fs.removeSync(tmpFilePath));
});
