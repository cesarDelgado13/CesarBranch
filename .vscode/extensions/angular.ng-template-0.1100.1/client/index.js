'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');
var path = require('path');
var vscode = require('vscode');
var vscodeLanguageclient = require('vscode-languageclient');
var vscodeJsonrpc = require('vscode-jsonrpc');
var child_process = require('child_process');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var vscode__default = /*#__PURE__*/_interopDefaultLegacy(vscode);
var vscodeLanguageclient__default = /*#__PURE__*/_interopDefaultLegacy(vscodeLanguageclient);
var vscodeJsonrpc__default = /*#__PURE__*/_interopDefaultLegacy(vscodeJsonrpc);
var child_process__default = /*#__PURE__*/_interopDefaultLegacy(child_process);

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var notifications = createCommonjsModule(function (module, exports) {
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NgccComplete = exports.RunNgcc = exports.ProjectLanguageService = exports.ProjectLoadingFinish = exports.ProjectLoadingStart = void 0;

exports.ProjectLoadingStart = new vscodeJsonrpc__default['default'].NotificationType0('angular/projectLoadingStart');
exports.ProjectLoadingFinish = new vscodeJsonrpc__default['default'].NotificationType0('angular/projectLoadingFinish');
exports.ProjectLanguageService = new vscodeJsonrpc__default['default'].NotificationType('angular/projectLanguageService');
exports.RunNgcc = new vscodeJsonrpc__default['default'].NotificationType('angular/runNgcc');
exports.NgccComplete = new vscodeJsonrpc__default['default'].NotificationType('angular/ngccComplete');

});

unwrapExports(notifications);
var notifications_1 = notifications.NgccComplete;
var notifications_2 = notifications.RunNgcc;
var notifications_3 = notifications.ProjectLanguageService;
var notifications_4 = notifications.ProjectLoadingFinish;
var notifications_5 = notifications.ProjectLoadingStart;

var commandNgcc = createCommonjsModule(function (module, exports) {
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAndRunNgcc = void 0;


function resolveNgccFrom(directory) {
    try {
        return commonjsRequire.resolve(`@angular/compiler-cli/ngcc/main-ngcc.js`, {
            paths: [directory],
        });
    }
    catch (_a) {
        return null;
    }
}
/**
 * Resolve ngcc from the directory that contains the specified `tsconfig` and
 * run ngcc.
 */
function resolveAndRunNgcc(tsconfig, progress) {
    return __awaiter(this, void 0, void 0, function* () {
        const directory = path__default['default'].dirname(tsconfig);
        const ngcc = resolveNgccFrom(directory);
        if (!ngcc) {
            throw new Error(`Failed to resolve ngcc from ${directory}`);
        }
        const childProcess = child_process__default['default'].spawn(ngcc, [
            '--tsconfig',
            tsconfig,
        ], {
            cwd: directory,
        });
        childProcess.stdout.on('data', (data) => {
            for (let entry of data.toString().split('\n')) {
                entry = entry.trim();
                if (entry) {
                    progress.report(entry);
                }
            }
        });
        return new Promise((resolve, reject) => {
            childProcess.on('error', (error) => {
                reject(error);
            });
            childProcess.on('close', (code) => {
                if (code === 0) {
                    resolve();
                }
                else {
                    throw new Error(`ngcc for ${tsconfig} returned exit code ${code}`);
                }
            });
        });
    });
}
exports.resolveAndRunNgcc = resolveAndRunNgcc;

});

unwrapExports(commandNgcc);
var commandNgcc_1 = commandNgcc.resolveAndRunNgcc;

var commands = createCommonjsModule(function (module, exports) {
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;

/**
 * Restart the language server by killing the process then spanwing a new one.
 * @param client language client
 */
function restartNgServer(client) {
    return {
        id: 'angular.restartNgServer',
        execute() {
            return __awaiter(this, void 0, void 0, function* () {
                yield client.stop();
                return client.start();
            });
        },
    };
}
/**
 * Register all supported vscode commands for the Angular extension.
 * @param client language client
 */
function registerCommands(client) {
    const commands = [
        restartNgServer(client),
    ];
    const disposables = commands.map((command) => {
        return vscode__default['default'].commands.registerCommand(command.id, command.execute);
    });
    return disposables;
}
exports.registerCommands = registerCommands;

});

unwrapExports(commands);
var commands_1 = commands.registerCommands;

var progressReporter = createCommonjsModule(function (module, exports) {
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withProgress = void 0;

const EMPTY_DISPOSABLE = vscode__default['default'].Disposable.from();
class ProgressReporter {
    constructor() {
        this.lastMessage = EMPTY_DISPOSABLE;
    }
    report(value) {
        this.lastMessage.dispose(); // clear the last message
        // See https://code.visualstudio.com/api/references/icons-in-labels for
        // icons available in vscode. "~spin" animates the icon.
        this.lastMessage = vscode__default['default'].window.setStatusBarMessage(`$(loading~spin) Angular: ${value}`);
    }
    finish() {
        this.lastMessage.dispose();
        this.lastMessage = EMPTY_DISPOSABLE;
    }
}
/**
 * Show progress in the editor. Progress is shown while running the given `task`
 * callback and while the promise it returns is in the pending state.
 * If the given `task` returns a rejected promise, this function will reject with
 * the same promise.
 */
function withProgress(options, task) {
    return __awaiter(this, void 0, void 0, function* () {
        // Although not strictly compatible, the signature of this function follows
        // the signature of vscode.window.withProgress() to make it easier to switch
        // to the official API if we choose to do so later.
        const reporter = new ProgressReporter();
        if (options.title) {
            reporter.report(options.title);
        }
        try {
            return yield task(reporter);
        }
        finally {
            reporter.finish();
        }
    });
}
exports.withProgress = withProgress;

});

unwrapExports(progressReporter);
var progressReporter_1 = progressReporter.withProgress;

var extension = createCommonjsModule(function (module, exports) {
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;








function activate(context) {
    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions = {
        run: getServerOptions(context, false /* debug */),
        debug: getServerOptions(context, true /* debug */),
    };
    // Options to control the language client
    const clientOptions = {
        // Register the server for Angular templates and TypeScript documents
        documentSelector: [
            // scheme: 'file' means listen to changes to files on disk only
            // other option is 'untitled', for buffer in the editor (like a new doc)
            { scheme: 'file', language: 'html' },
            { scheme: 'file', language: 'typescript' },
        ],
        synchronize: {
            fileEvents: [
                // Notify the server about file changes to tsconfig.json contained in the workspace
                vscode__default['default'].workspace.createFileSystemWatcher('**/tsconfig.json'),
            ]
        },
        // Don't let our output console pop open
        revealOutputChannelOn: vscodeLanguageclient__default['default'].RevealOutputChannelOn.Never
    };
    // Create the language client and start the client.
    const forceDebug = process.env['NG_DEBUG'] === 'true';
    const client = new vscodeLanguageclient__default['default'].LanguageClient('Angular Language Service', serverOptions, clientOptions, forceDebug);
    // Push the disposable to the context's subscriptions so that the
    // client can be deactivated on extension deactivation
    context.subscriptions.push(...commands.registerCommands(client), client.start());
    client.onDidChangeState((e) => {
        if (e.newState === vscodeLanguageclient__default['default'].State.Running) {
            registerNotificationHandlers(client);
        }
    });
}
exports.activate = activate;
function registerNotificationHandlers(client) {
    client.onNotification(notifications.ProjectLoadingStart, () => {
        vscode__default['default'].window.withProgress({
            location: vscode__default['default'].ProgressLocation.Window,
            title: 'Initializing Angular language features',
        }, () => new Promise((resolve) => {
            client.onNotification(notifications.ProjectLoadingFinish, resolve);
        }));
    });
    client.onNotification(notifications.RunNgcc, (params) => __awaiter(this, void 0, void 0, function* () {
        const { configFilePath } = params;
        try {
            yield progressReporter.withProgress({
                location: vscode__default['default'].ProgressLocation.Window,
                title: `Running ngcc for project ${configFilePath}`,
                cancellable: false,
            }, (progress) => {
                return commandNgcc.resolveAndRunNgcc(configFilePath, progress);
            });
            client.sendNotification(notifications.NgccComplete, {
                configFilePath,
                success: true,
            });
        }
        catch (e) {
            vscode__default['default'].window.showWarningMessage(`Failed to run ngcc. Ivy language service might not function correctly. Please see the log file for more information.`);
            client.sendNotification(notifications.NgccComplete, {
                configFilePath,
                success: false,
                error: e.message,
            });
        }
    }));
}
/**
 * Return the paths for the module that corresponds to the specified `configValue`,
 * and use the specified `bundled` as fallback if none is provided.
 * @param configName
 * @param bundled
 */
function getProbeLocations(configValue, bundled) {
    const locations = [];
    // Always use config value if it's specified
    if (configValue) {
        locations.push(configValue);
    }
    // Prioritize the bundled version
    locations.push(bundled);
    // Look in workspaces currently open
    const workspaceFolders = vscode__default['default'].workspace.workspaceFolders || [];
    for (const folder of workspaceFolders) {
        locations.push(folder.uri.fsPath);
    }
    return locations;
}
/**
 * Construct the arguments that's used to spawn the server process.
 * @param ctx vscode extension context
 * @param debug true if debug mode is on
 */
function constructArgs(ctx, debug) {
    const config = vscode__default['default'].workspace.getConfiguration();
    const args = [];
    const ngLog = config.get('angular.log', 'off');
    if (ngLog !== 'off') {
        // Log file does not yet exist on disk. It is up to the server to create the file.
        const logFile = path__default['default'].join(ctx.logPath, 'nglangsvc.log');
        args.push('--logFile', logFile);
        args.push('--logVerbosity', debug ? 'verbose' : ngLog);
    }
    const ngdk = config.get('angular.ngdk', null);
    const ngProbeLocations = getProbeLocations(ngdk, ctx.asAbsolutePath('server'));
    args.push('--ngProbeLocations', ngProbeLocations.join(','));
    const experimentalIvy = config.get('angular.experimental-ivy', false);
    if (experimentalIvy) {
        args.push('--experimental-ivy');
    }
    const tsdk = config.get('typescript.tsdk', null);
    const tsProbeLocations = getProbeLocations(tsdk, ctx.extensionPath);
    args.push('--tsProbeLocations', tsProbeLocations.join(','));
    return args;
}
function getServerOptions(ctx, debug) {
    // Environment variables for server process
    const prodEnv = {
        // Force TypeScript to use the non-polling version of the file watchers.
        TSC_NONPOLLING_WATCHER: true,
    };
    const devEnv = Object.assign(Object.assign({}, prodEnv), { NG_DEBUG: true });
    // Node module for the language server
    const prodBundle = ctx.asAbsolutePath('server');
    const devBundle = ctx.asAbsolutePath(path__default['default'].join('server', 'out', 'server.js'));
    // Argv options for Node.js
    const prodExecArgv = [];
    const devExecArgv = [
        // do not lazily evaluate the code so all breakpoints are respected
        '--nolazy',
        // If debugging port is changed, update .vscode/launch.json as well
        '--inspect=6009',
    ];
    return {
        // VS Code Insider launches extensions in debug mode by default but users
        // install prod bundle so we have to check whether dev bundle exists.
        module: debug && fs__default['default'].existsSync(devBundle) ? devBundle : prodBundle,
        transport: vscodeLanguageclient__default['default'].TransportKind.ipc,
        args: constructArgs(ctx, debug),
        options: {
            env: debug ? devEnv : prodEnv,
            execArgv: debug ? devExecArgv : prodExecArgv,
        },
    };
}

});

var extension$1 = unwrapExports(extension);
var extension_1 = extension.activate;

exports.activate = extension_1;
exports.default = extension$1;
