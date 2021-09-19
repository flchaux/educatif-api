"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const pify = require("pify");
const candidateUnityPaths = [
    '/opt/Unity/Editor/Unity',
    '/Applications/Unity/Unity.app/Contents/MacOS/Unity',
    'C:\\Program Files (x86)\\Unity\\Editor\\Unity.exe',
    'C:\\Program Files\\Unity\\Editor\\Unity.exe' // Windows x64
];
let unityBinaryPath;
function getUnityPath() {
    return __awaiter(this, void 0, void 0, function* () {
        // this is not a pure function and it caches its result
        if (unityBinaryPath) {
            return unityBinaryPath;
        }
        //=> Try all paths, take the first
        for (const path of candidateUnityPaths) {
            try {
                yield pify(fs.access)(path, fs.constants.X_OK);
                return unityBinaryPath = path;
            }
            catch (err) { }
        }
        //=> Oops, no Unity installation found
        const triedPaths = candidateUnityPaths.map(path => `"${path}"`).join(', ');
        throw new Error(`Unable to locate Unity installation, tried all of these paths: ${triedPaths}. ` +
            `Please use setUnityPath('/path/to/unity/executable').`);
    });
}
exports.getUnityPath = getUnityPath;
function setUnityPath(executablePath) {
    unityBinaryPath = executablePath;
}
exports.setUnityPath = setUnityPath;
