"use strict";
var commands = require("./commands");
var Gist = require("./api/gist");
var vscode = require('vscode');
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.privateGist', commands.createGist.bind(undefined, Gist.Type.PRIVATE)));
    context.subscriptions.push(vscode.commands.registerCommand('extension.publicGist', commands.createGist.bind(undefined, Gist.Type.PUBLIC)));
    context.subscriptions.push(vscode.commands.registerCommand('extension.anonymousGist', commands.createGist.bind(undefined, Gist.Type.ANONYMOUS)));
    context.subscriptions.push(vscode.commands.registerCommand('extension.openGist', commands.openGist));
    context.subscriptions.push(vscode.commands.registerCommand('extension.openStarredGist', commands.openStarredGist));
    context.subscriptions.push(vscode.commands.registerCommand('extension.deleteCurrentGist', commands.deleteCurrentGist));
    context.subscriptions.push(vscode.commands.registerCommand('extension.removeFileFromGist', commands.removeFileFromGist));
    context.subscriptions.push(vscode.commands.registerCommand('extension.addNewFileToGist', commands.addNewFileToGist));
    context.subscriptions.push(vscode.commands.registerCommand('extension.changeGistDescription', commands.changeGistDescription));
    context.subscriptions.push(vscode.commands.registerCommand('extension.openGistInBrowser', commands.openGistInBrowser));
    vscode.workspace.onDidSaveTextDocument(commands.onSave);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map