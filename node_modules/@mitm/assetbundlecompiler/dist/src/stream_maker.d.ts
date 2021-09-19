/// <reference types="node" />
import * as fs from 'fs';
export declare type ReadableFileInput = string | fs.ReadStream;
export declare type WritableFileInput = string | fs.WriteStream;
export declare function normalizeReadStream(file: ReadableFileInput): fs.ReadStream;
export declare function normalizeWriteStream(file: WritableFileInput): fs.WriteStream;
export declare function isReadStream(file: ReadableFileInput): file is fs.ReadStream;
export declare function isWriteStream(file: WritableFileInput): file is fs.WriteStream;
