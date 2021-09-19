/// <reference types="node" />
import { logger } from '@mitm/unityinvoker';
import * as fs from 'fs';
import { BuildContext } from './build_context';
import * as buildTargets from './build_targets';
export declare type BuildTarget = (keyof typeof buildTargets) | string;
export interface IAssetBundleManifest {
    ManifestFileVersion: number;
    CRC: number;
    Hashes: {
        [HashType: string]: {
            serializedVersion: number;
            Hash: string;
        };
    };
    HashAppended: number;
    ClassTypes: Array<{
        Class: number;
        Script: any;
    }>;
    Assets: string[];
    Dependencies: any[];
}
export declare const ProjectDirectory: string;
export declare function shouldCreateProject(): Promise<boolean>;
export declare function copyEditorScript(): Promise<void>;
export declare function warmupProject(context: BuildContext): Promise<void>;
export declare function copyEditorScriptsInProject(context: BuildContext, scriptsStreams: fs.ReadStream[]): Promise<void>;
export declare function copyAssetsInProject(context: BuildContext, assetStreams: fs.ReadStream[]): Promise<void>;
export declare function generateAssetBundle(context: BuildContext, fileStreams: fs.ReadStream[], buildOptions: Set<string>, buildTarget: BuildTarget, unityLogger?: logger.SimpleLogger, signalAssetProcessed?: logger.SimpleLogger): Promise<IAssetBundleManifest>;
export declare function moveGeneratedAssetBundle(context: BuildContext, finalDest: fs.WriteStream, finalManifestDest: fs.WriteStream | null, overwrite: boolean): Promise<void>;
export declare function cleanupProject(context: BuildContext): Promise<void>;
