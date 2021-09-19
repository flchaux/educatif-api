"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const logger = require("./logger");
exports.logger = logger;
const unity_process_1 = require("./unity_process");
__export(require("./unity_finder"));
var unity_process_2 = require("./unity_process");
exports.LinuxPlayerArch = unity_process_2.LinuxPlayerArch;
exports.OSXPlayerArch = unity_process_2.OSXPlayerArch;
exports.WindowsPlayerArch = unity_process_2.WindowsPlayerArch;
exports.RendererType = unity_process_2.RendererType;
var unity_invoker_1 = require("./unity_invoker");
exports.UnityCrashError = unity_invoker_1.UnityCrashError;
function invokeUnity(options = {}) {
    return new unity_process_1.UnityProcess().withOptions(options);
}
exports.invokeUnity = invokeUnity;
function invokeHeadlessUnity(options = {}) {
    return invokeUnity(options).logFile(null).batchmode().noGraphics().quit();
}
exports.invokeHeadlessUnity = invokeHeadlessUnity;
