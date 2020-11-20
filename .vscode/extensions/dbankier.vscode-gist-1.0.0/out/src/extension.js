"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const gist_service_1 = require("./services/gist.service");
const commands_1 = require("./commands");
function activate(context) {
    const gist = new gist_service_1.GistService(context.globalState);
    const cmd = new commands_1.Commands({ gist }, context.globalState);
    const subscriptions = context.subscriptions;
    const registerCommand = vscode_1.commands.registerCommand;
    // This will need to be removed in a future release
    const deprecatedToken = vscode_1.workspace.getConfiguration('gist').get('oauth_token');
    if (deprecatedToken) {
        gist.setToken(deprecatedToken);
    }
    subscriptions.push(registerCommand('extension.openCodeBlock', cmd.openCodeBlock, cmd), registerCommand('extension.openFavoriteCodeBlock', cmd.openCodeBlock.bind(cmd, true)), registerCommand('extension.createCodeBlock', cmd.createCodeBlock, cmd), registerCommand('extension.openCodeBlockInBrowser', cmd.openCodeBlockInBrowser, cmd), registerCommand('extension.deleteCodeBlock', cmd.deleteCodeBlock, cmd), registerCommand('extension.removeFileFromCodeBlock', cmd.removeFileFromCodeBlock, cmd), registerCommand('extension.addToCodeBlock', cmd.addToCodeBlock, cmd), registerCommand('extension.changeCodeBlockDescription', cmd.changeCodeBlockDescription, cmd));
    vscode_1.workspace.onDidSaveTextDocument(cmd.onSaveTextDocument, cmd);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map