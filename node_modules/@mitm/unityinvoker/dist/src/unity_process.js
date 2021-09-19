"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logger");
const unity_invoker_1 = require("./unity_invoker");
var LinuxPlayerArch;
(function (LinuxPlayerArch) {
    LinuxPlayerArch[LinuxPlayerArch["x86"] = 0] = "x86";
    LinuxPlayerArch[LinuxPlayerArch["x64"] = 1] = "x64";
    LinuxPlayerArch[LinuxPlayerArch["Universal"] = 2] = "Universal";
})(LinuxPlayerArch = exports.LinuxPlayerArch || (exports.LinuxPlayerArch = {}));
var OSXPlayerArch;
(function (OSXPlayerArch) {
    OSXPlayerArch[OSXPlayerArch["x86"] = 0] = "x86";
    OSXPlayerArch[OSXPlayerArch["x64"] = 1] = "x64";
    OSXPlayerArch[OSXPlayerArch["Universal"] = 2] = "Universal";
})(OSXPlayerArch = exports.OSXPlayerArch || (exports.OSXPlayerArch = {}));
var WindowsPlayerArch;
(function (WindowsPlayerArch) {
    WindowsPlayerArch[WindowsPlayerArch["x86"] = 0] = "x86";
    WindowsPlayerArch[WindowsPlayerArch["x64"] = 1] = "x64";
})(WindowsPlayerArch = exports.WindowsPlayerArch || (exports.WindowsPlayerArch = {}));
var RendererType;
(function (RendererType) {
    /**
     * Make the Editor use Direct3D 9 or 11 for rendering.
     * Normally the graphics API depends on player settings (typically defaults to D3D11).
     */
    RendererType[RendererType["Direct3D"] = 0] = "Direct3D";
    /**
     * Make the Editor use OpenGL 3/4 core profile for rendering.
     * If the platform isn’t supported, Direct3D is used.
     */
    RendererType[RendererType["OpenGLCore"] = 1] = "OpenGLCore";
    /**
     * Make the Editor use OpenGL for Embedded Systems for rendering.
     */
    RendererType[RendererType["OpenGLES"] = 2] = "OpenGLES";
})(RendererType = exports.RendererType || (exports.RendererType = {}));
class UnityProcess {
    constructor() {
        this.processOptions = {};
    }
    /**
     * Set Unity CLI options by hand, without using the fluent methods.
     */
    withOptions(options) {
        Object.assign(this.processOptions, options);
        return this;
    }
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
    batchmode(enabled = true) {
        this.processOptions.batchmode = enabled;
        return this;
    }
    /**
     * Build a standalone Linux player.
     */
    buildLinuxPlayer(arch, path) {
        let prop;
        switch (arch) {
            case LinuxPlayerArch.x86:
                prop = 'buildLinux32Player';
                break;
            case LinuxPlayerArch.x64:
                prop = 'buildLinux64Player';
                break;
            case LinuxPlayerArch.Universal:
                prop = 'buildLinuxUniversalPlayer';
                break;
            default: throw new Error(`Invalid Linux architecture: ${arch}.`);
        }
        this.processOptions[prop] = path;
        return this;
    }
    /**
     * Build a standalone Mac OSX player.
     */
    buildOSXPlayer(arch, path) {
        let prop;
        switch (arch) {
            case OSXPlayerArch.x86:
                prop = 'buildOSXPlayer';
                break;
            case OSXPlayerArch.x64:
                prop = 'buildOSX64Player';
                break;
            case OSXPlayerArch.Universal:
                prop = 'buildOSXUniversalPlayer';
                break;
            default: throw new Error(`Invalid OSX architecture: ${arch}.`);
        }
        this.processOptions[prop] = path;
        return this;
    }
    /**
     * Allows the selection of an active build target before a project is loaded.
     * Possible options are: win32, win64, osx, linux, linux64, ios, android, web, webstreamed, webgl, xboxone, ps4,
     * psp2, wsaplayer, tizen, samsungtv.
     */
    buildTarget(name) {
        this.processOptions.buildTarget = name;
        return this;
    }
    /**
     * Build a standalone Windows player.
     */
    buildWindowsPlayer(arch, path) {
        let prop;
        switch (arch) {
            case WindowsPlayerArch.x86:
                prop = 'buildWindowsPlayer';
                break;
            case WindowsPlayerArch.x64:
                prop = 'buildWindows64Player';
                break;
            default: throw new Error(`Invalid Windows architecture: ${arch}.`);
        }
        this.processOptions[prop] = path;
        return this;
    }
    /**
     * Detailed debugging feature. StackTraceLogging allows features to be controlled to allow detailed logging.
     * All settings allow None, Script Only and Full to be selected.
     */
    cleanedLogFile(enabled = true) {
        this.processOptions.cleanedLogFile = enabled;
        return this;
    }
    /**
     * Create an empty project at the given path.
     */
    createProject(projectPath) {
        this.processOptions.createProject = projectPath;
        return this;
    }
    /**
     * Filter editor tests by categories.
     */
    editorTestsCategories(...categories) {
        this.processOptions.editorTestsCategories = categories.join(',');
        return this;
    }
    /**
     * Filter editor tests by names.
     */
    editorTestsFilter(...filteredTestsNames) {
        this.processOptions.editorTestsFilter = filteredTestsNames.join(',');
        return this;
    }
    /**
     * Path where the result file should be placed. If the path is a folder, a default file name is used.
     * If not specified, the results are placed in the project’s root folder.
     */
    editorTestsResultFile(filePath) {
        this.processOptions.editorTestsResultFile = filePath;
        return this;
    }
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
    executeMethod(staticMethodPath) {
        this.processOptions.executeMethod = staticMethodPath;
        return this;
    }
    /**
     * Export a package, given a path (or set of given paths).
     * In this example exportAssetPath is a folder (relative to to the Unity project root) to export from the Unity
     * project, and exportFileName is the package name.
     * Currently, this option only exports whole folders at a time.
     * This command normally needs to be used with the -projectPath argument.
     */
    exportPackage({ folderPaths, packageFilePath }) {
        this.processOptions.exportPackage = folderPaths.concat([packageFilePath]).join(' ');
        return this;
    }
    /**
     * Sets the renderer used by the Editor for rendering.
     */
    useRenderer(type, version) {
        let prop;
        switch (type) {
            case RendererType.Direct3D:
                prop = 'force-d3d';
                break;
            case RendererType.OpenGLCore:
                prop = 'force-glcore';
                break;
            case RendererType.OpenGLES:
                prop = 'force-gles';
                break;
            default: throw new Error(`Invalid renderer type: ${type}.`);
        }
        this.processOptions[`${prop}${version || ''}`] = true;
        return this;
    }
    /**
     * Used with useRenderer(Renderer.OpenGLCore, version) to prevent checking for additional OpenGL extensions,
     * allowing it to run between platforms with the same code paths.
     */
    forceClamped(enabled) {
        this.processOptions['force-clamped'] = enabled;
        return this;
    }
    /**
     * Make the Editor run as if there is a free Unity license on the machine, even if a Unity Pro license is installed.
     */
    forceFree(enabled) {
        this.processOptions['force-free'] = enabled;
        return this;
    }
    /**
     * Import the given package. No import dialog is shown.
     */
    importPackage(packageFilePath) {
        this.processOptions.importPackage = packageFilePath;
        return this;
    }
    /**
     * Specify where the Editor or Windows/Linux/OSX standalone log file are written.
     * Pass null to make UnityInvoker catch Unity's logs.
     */
    logFile(logFilePath) {
        this.processOptions.logFile = logFilePath === null ? true : logFilePath;
        return this;
    }
    /**
     * When running in batch mode, do not initialize the graphics device at all.
     * This makes it possible to run your automated workflows on machines that don’t even have a GPU (automated
     * workflows only work when you have a window in focus, otherwise you can’t send simulated input commands).
     * lease note that noGraphics() does not allow you to bake GI on OSX, since Enlighten requires GPU acceleration.
     */
    noGraphics(enabled = true) {
        this.processOptions.nographics = enabled;
        return this;
    }
    /**
     * The password of the user.
     */
    password(password) {
        this.processOptions.password = password;
        return this;
    }
    /**
     * Open the project at the given path.
     */
    projectPath(projectPath) {
        this.processOptions.projectPath = projectPath;
        return this;
    }
    /**
     * Quit the Unity Editor after other commands have finished executing.
     * Note that this can cause error messages to be hidden (however, they still appear in the editor logs).
     */
    quit(enabled = true) {
        this.processOptions.quit = enabled;
        return this;
    }
    /**
     * Return the currently active license to the license server.
     * Please allow a few seconds before the license file is removed, because Unity needs to communicate with the
     * license server.
     */
    returnLicense(enabled = true) {
        this.processOptions.quit = enabled;
        return this;
    }
    /**
     * Run Editor tests from the project.
     * This argument requires the projectPath(), and it’s good practice to run it with batchmode().
     * quit() is not required, because the Editor automatically closes down after the run is finished.
     */
    runEditorTests() {
        this.processOptions.runEditorTests = true;
        return this;
    }
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
    serial(serial) {
        this.processOptions.serial = serial;
        return this;
    }
    /**
     * Don’t display a crash dialog.
     */
    silentCrashes(enabled = true) {
        this.processOptions['silent-crashes'] = enabled;
        return this;
    }
    /**
     * Enter a username into the log-in form during activation of the Unity Editor.
     */
    username(username) {
        this.processOptions.username = username;
        return this;
    }
    /**
     * Pass all assemblies updates.
     * See also disableAssemblyUpdaterFor() to ignore only specific assemblies.
     */
    disableAssemblyUpdater(enabled = true) {
        this.processOptions['disable-assembly-updater'] = enabled;
        return this;
    }
    /**
     * Specify a list of assembly names as parameters for Unity to ignore on automatic updates.
     */
    disableAssemblyUpdaterFor(...assemblyPaths) {
        this.processOptions['disable-assembly-updater'] = assemblyPaths;
        return this;
    }
    /**
     * Launch Unity with given options, terminates the fluent calls chain by returning a Promise.
     * Resolves with Unity's stdout log (only if logFile(null) has been called).
     */
    run(logger = logger_1.noopLogger) {
        return unity_invoker_1.runUnityProcess(this.processOptions, logger);
    }
}
exports.UnityProcess = UnityProcess;
