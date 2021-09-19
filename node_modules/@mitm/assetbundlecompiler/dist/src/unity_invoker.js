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
const unityinvoker_1 = require("@mitm/unityinvoker");
function createProject(directory) {
    return __awaiter(this, void 0, void 0, function* () {
        yield unityinvoker_1.invokeHeadlessUnity().createProject(directory).run();
    });
}
exports.createProject = createProject;
function generateAssetBundle(directory, cAssetNames, cAssetBundleDirectory, cAssetBundleName, cAssetBundleBuildOptions, cAssetBundleTarget, unityLogger = unityinvoker_1.logger.noopLogger, signalAssetProcessed = unityinvoker_1.logger.noopLogger) {
    return __awaiter(this, void 0, void 0, function* () {
        const scriptOptions = {
            cAssetNames, cAssetBundleDirectory, cAssetBundleName,
            cAssetBundleBuildOptions: Array.from(cAssetBundleBuildOptions),
            cAssetBundleTarget
        };
        let compilerError = null;
        function handleLogLine(message) {
            unityLogger(message);
            const updatingAsset = getUpdatingAsset(message);
            const unrecogAsset = getUnrecognizedAsset(message);
            if (updatingAsset) {
                signalAssetProcessed(updatingAsset);
            }
            else if (unrecogAsset) {
                compilerError = new Error(`File "${unrecogAsset}" is not processable by Unity, this is not a valid asset.`);
            }
        }
        yield unityinvoker_1.invokeHeadlessUnity()
            .projectPath(directory)
            .executeMethod('AssetBundleCompiler.Convert')
            .withOptions(scriptOptions)
            .run(handleLogLine);
        //=> For now we rethrow the last encountered error, sometimes long after it has been encoutered.
        //   @todo make it better.
        if (compilerError) {
            throw compilerError;
        }
    });
}
exports.generateAssetBundle = generateAssetBundle;
function getUpdatingAsset(message) {
    const updateMessage = /^Updating Assets\/CopiedAssets\/(.+?)(?= - GUID)/;
    const matches = message.match(updateMessage);
    return matches !== null ? matches[1] : null;
}
function getUnrecognizedAsset(message) {
    const unrecogMessage = /^Unrecognized assets cannot be included in AssetBundles?: "Assets\/CopiedAssets\/(.+?)"/;
    const matches = message.match(unrecogMessage);
    return matches !== null ? matches[1] : null;
}
