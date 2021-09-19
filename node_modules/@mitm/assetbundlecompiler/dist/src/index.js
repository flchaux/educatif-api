"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const assets_bundler_1 = require("./assets_bundler");
const BuildTargets = require("./build_targets");
exports.BuildTargets = BuildTargets;
var unityinvoker_1 = require("@mitm/unityinvoker");
exports.setUnityPath = unityinvoker_1.setUnityPath;
exports.UnityCrashError = unityinvoker_1.UnityCrashError;
__export(require("./assets_bundler"));
function bundle(...assets) {
    return new assets_bundler_1.AssetsBundler().includingAssets(...assets);
}
exports.bundle = bundle;
