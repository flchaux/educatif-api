import { SimpleLogger } from './logger';
import { BuildTarget, IUnityOptions } from './unity_cli_options';
export declare enum LinuxPlayerArch {
    x86 = 0,
    x64 = 1,
    Universal = 2,
}
export declare enum OSXPlayerArch {
    x86 = 0,
    x64 = 1,
    Universal = 2,
}
export declare enum WindowsPlayerArch {
    x86 = 0,
    x64 = 1,
}
export declare enum RendererType {
    /**
     * Make the Editor use Direct3D 9 or 11 for rendering.
     * Normally the graphics API depends on player settings (typically defaults to D3D11).
     */
    Direct3D = 0,
    /**
     * Make the Editor use OpenGL 3/4 core profile for rendering.
     * If the platform isn’t supported, Direct3D is used.
     */
    OpenGLCore = 1,
    /**
     * Make the Editor use OpenGL for Embedded Systems for rendering.
     */
    OpenGLES = 2,
}
export declare type RendererVersion = number;
export declare class UnityProcess {
    private processOptions;
    /**
     * Set Unity CLI options by hand, without using the fluent methods.
     */
    withOptions(options: IUnityOptions): this;
    /**
     * Run Unity in batch mode.
     * This should always be used in conjunction with the other command line arguments, because it ensures no pop-up
     * windows appear and eliminates the need for any human intervention. When an exception occurs during execution of
     * the script code, the Asset server updates fail, or other operations that fail, Unity immediately exits with
     * return code 1.
     * Note that in batch mode, Unity sends a minimal version of its log output to the console.
     * However, the Log Files still contain the full log information. Opening a project in batch mode while the Editor
     * has the same project open is not supported; only a single instance of Unity can run at a time.
     */
    batchmode(enabled?: boolean): this;
    /**
     * Build a standalone Linux player.
     */
    buildLinuxPlayer(arch: LinuxPlayerArch, path: string): this;
    /**
     * Build a standalone Mac OSX player.
     */
    buildOSXPlayer(arch: OSXPlayerArch, path: string): this;
    /**
     * Allows the selection of an active build target before a project is loaded.
     * Possible options are: win32, win64, osx, linux, linux64, ios, android, web, webstreamed, webgl, xboxone, ps4,
     * psp2, wsaplayer, tizen, samsungtv.
     */
    buildTarget(name: BuildTarget): this;
    /**
     * Build a standalone Windows player.
     */
    buildWindowsPlayer(arch: WindowsPlayerArch, path: string): this;
    /**
     * Detailed debugging feature. StackTraceLogging allows features to be controlled to allow detailed logging.
     * All settings allow None, Script Only and Full to be selected.
     */
    cleanedLogFile(enabled?: boolean): this;
    /**
     * Create an empty project at the given path.
     */
    createProject(projectPath: string): this;
    /**
     * Filter editor tests by categories.
     */
    editorTestsCategories(...categories: string[]): this;
    /**
     * Filter editor tests by names.
     */
    editorTestsFilter(...filteredTestsNames: string[]): this;
    /**
     * Path where the result file should be placed. If the path is a folder, a default file name is used.
     * If not specified, the results are placed in the project’s root folder.
     */
    editorTestsResultFile(filePath: string): this;
    /**
     * Execute the static method as soon as Unity is started, the project is open and after the optional Asset server
     * update has been performed. This can be used to do tasks such as continous integration, performing Unit Tests,
     * making builds or preparing data.
     * To return an error from the command line process, either throw an exception which causes Unity to exit with
     * return code 1, or call EditorApplication.Exit with a non-zero return code.
     * To pass parameters, add them to the command line and retrieve them inside the function using
     * System.Environment.GetCommandLineArgs.
     * To use -executeMethod, you need to place the enclosing script in an Editor folder. The method to be executed
     * must be defined as static.
     */
    executeMethod(staticMethodPath: string): this;
    /**
     * Export a package, given a path (or set of given paths).
     * In this example exportAssetPath is a folder (relative to to the Unity project root) to export from the Unity
     * project, and exportFileName is the package name.
     * Currently, this option only exports whole folders at a time.
     * This command normally needs to be used with the -projectPath argument.
     */
    exportPackage({folderPaths, packageFilePath}: {
        folderPaths: string[];
        packageFilePath: string;
    }): this;
    /**
     * Sets the renderer used by the Editor for rendering.
     */
    useRenderer(type: RendererType, version?: RendererVersion): this;
    /**
     * Used with useRenderer(Renderer.OpenGLCore, version) to prevent checking for additional OpenGL extensions,
     * allowing it to run between platforms with the same code paths.
     */
    forceClamped(enabled: boolean): this;
    /**
     * Make the Editor run as if there is a free Unity license on the machine, even if a Unity Pro license is installed.
     */
    forceFree(enabled: boolean): this;
    /**
     * Import the given package. No import dialog is shown.
     */
    importPackage(packageFilePath: string): this;
    /**
     * Specify where the Editor or Windows/Linux/OSX standalone log file are written.
     * Pass null to make UnityInvoker catch Unity's logs.
     */
    logFile(logFilePath: string | null): this;
    /**
     * When running in batch mode, do not initialize the graphics device at all.
     * This makes it possible to run your automated workflows on machines that don’t even have a GPU (automated
     * workflows only work when you have a window in focus, otherwise you can’t send simulated input commands).
     * lease note that noGraphics() does not allow you to bake GI on OSX, since Enlighten requires GPU acceleration.
     */
    noGraphics(enabled?: boolean): this;
    /**
     * The password of the user.
     */
    password(password: string): this;
    /**
     * Open the project at the given path.
     */
    projectPath(projectPath: string): this;
    /**
     * Quit the Unity Editor after other commands have finished executing.
     * Note that this can cause error messages to be hidden (however, they still appear in the editor logs).
     */
    quit(enabled?: boolean): this;
    /**
     * Return the currently active license to the license server.
     * Please allow a few seconds before the license file is removed, because Unity needs to communicate with the
     * license server.
     */
    returnLicense(enabled?: boolean): this;
    /**
     * Run Editor tests from the project.
     * This argument requires the projectPath(), and it’s good practice to run it with batchmode().
     * quit() is not required, because the Editor automatically closes down after the run is finished.
     */
    runEditorTests(): this;
    /**
     * Activate Unity with the specified serial key.
     * It is good practice to pass the batchmode() and quit() as well, in order to quit Unity when done, if using this
     * for automated activation of Unity.
     * Please allow a few seconds before the license file is created, because Unity needs to communicate with the
     * license server.
     * Make sure that license file folder exists, and has appropriate permissions before running Unity with this
     * argument.
     * If activation fails, see the editor's log for info.
     */
    serial(serial: string): this;
    /**
     * Don’t display a crash dialog.
     */
    silentCrashes(enabled?: boolean): this;
    /**
     * Enter a username into the log-in form during activation of the Unity Editor.
     */
    username(username: string): this;
    /**
     * Pass all assemblies updates.
     * See also disableAssemblyUpdaterFor() to ignore only specific assemblies.
     */
    disableAssemblyUpdater(enabled?: boolean): this;
    /**
     * Specify a list of assembly names as parameters for Unity to ignore on automatic updates.
     */
    disableAssemblyUpdaterFor(...assemblyPaths: string[]): this;
    /**
     * Launch Unity with given options, terminates the fluent calls chain by returning a Promise.
     * Resolves with Unity's stdout log (only if logFile(null) has been called).
     */
    run(logger?: SimpleLogger): Promise<string>;
}
