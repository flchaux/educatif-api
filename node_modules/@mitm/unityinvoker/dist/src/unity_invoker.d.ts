import { SimpleLogger } from './logger';
import { IUnityOptions } from './unity_cli_options';
export declare function runUnityProcess(options: IUnityOptions, logger: SimpleLogger): Promise<string>;
export declare function toArgv(options: IUnityOptions): string[];
export declare class UnityCrashError extends Error {
    readonly unityLog: string;
    constructor(message: string, unityLog: string);
}
