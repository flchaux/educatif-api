"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
function normalizeReadStream(file) {
    if (typeof file === 'string') {
        file = fs.createReadStream(file);
    }
    else if (!isReadStream(file)) {
        throw new Error(`Expected file path or fs.ReadStream, got ${file}.`);
    }
    return file;
}
exports.normalizeReadStream = normalizeReadStream;
function normalizeWriteStream(file) {
    if (typeof file === 'string') {
        file = fs.createWriteStream(file);
    }
    else if (!isWriteStream(file)) {
        throw new Error(`Expected file path or fs.WriteStream, got ${file}.`);
    }
    return file;
}
exports.normalizeWriteStream = normalizeWriteStream;
function isReadStream(file) {
    const stream = file;
    return !!(stream && stream.path !== undefined && stream.bytesRead !== undefined);
}
exports.isReadStream = isReadStream;
function isWriteStream(file) {
    const stream = file;
    return !!(stream && stream.path !== undefined && stream.bytesWritten !== undefined);
}
exports.isWriteStream = isWriteStream;
