import { logger } from '@mitm/unityinvoker';
import * as streamMaker from './stream_maker';
import * as unityproj from './unity_project';
export interface IBuildOptionsMap {
    /** Allows custom build options (ie. Unity adds enum members and the lib is not in sync) */
    [enumMemberName: string]: boolean | undefined;
    /** Build assetBundle without any special option. */
    none?: boolean;
    /** Don't compress the data when creating the asset bundle. */
    uncompressedAssetBundle?: boolean;
    /** Do not include type information within the AssetBundle. */
    disableWriteTypeTree?: boolean;
    /** Builds an asset bundle using a hash for the id of the object stored in the asset bundle. */
    deterministicAssetBundle?: boolean;
    /** Force rebuild the assetBundles. */
    forceRebuildAssetBundle?: boolean;
    /** Ignore the type tree changes when doing the incremental build check. */
    ignoreTypeTreeChanges?: boolean;
    /** Append the hash to the assetBundle name. */
    appendHashToAssetBundleName?: boolean;
    /** Use chunk-based LZ4 compression when creating the AssetBundle. */
    chunkBasedCompression?: boolean;
    /** Do not allow the build to succeed if any errors are reporting during it. */
    strictMode?: boolean;
    /** Do a dry run build. */
    dryRunBuild?: boolean;
    /** Disables Asset Bundle LoadAsset by file name. */
    disableLoadAssetByFileName?: boolean;
    /** Disables Asset Bundle LoadAsset by file name with extension. */
    disableLoadAssetByFileNameWithExtension?: boolean;
}
export interface IExportOptions {
    overwrite?: boolean;
    manifestFile?: streamMaker.WritableFileInput;
}
export declare class AssetsBundler {
    private logger;
    private unityLogger;
    private editorScriptsStreams;
    private assetsStreams;
    private buildOptions;
    private buildTarget;
    private state;
    includingAssets(...assets: streamMaker.ReadableFileInput[]): this;
    targeting(buildTarget: unityproj.BuildTarget): this;
    withLogger(loggerFn: logger.SimpleLogger): this;
    withUnityLogger(unityLogger: logger.SimpleLogger): this;
    withBuildOptions(buildOptions: IBuildOptionsMap): this;
    includingEditorScripts(...scripts: streamMaker.ReadableFileInput[]): this;
    to(file: streamMaker.WritableFileInput, options?: IExportOptions): Promise<unityproj.IAssetBundleManifest>;
    private cleanup(context);
    private signalCleanup(context);
    private checkLoggerType(loggerFn);
    private checkBundlerIsntAlreadyConfigured();
}
