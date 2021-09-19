import { logger } from '@mitm/unityinvoker';
export declare function createProject(directory: string): Promise<void>;
export declare function generateAssetBundle(directory: string, cAssetNames: string[], cAssetBundleDirectory: string, cAssetBundleName: string, cAssetBundleBuildOptions: Set<string>, cAssetBundleTarget: string, unityLogger?: logger.SimpleLogger, signalAssetProcessed?: logger.SimpleLogger): Promise<void>;
