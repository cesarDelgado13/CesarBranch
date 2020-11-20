"use strict";
var vscode = require('vscode');
var Gist = require("../api/gist");
var path = require("path");
var fs = require("fs");
var open = require('open');
var tmp = require('tmp');
var request = require("bluebird").promisify(require("request"));
function createGist(type) {
    var editor = vscode.window.activeTextEditor;
    if (!editor) {
        return vscode.window.showErrorMessage("First open a file");
    }
    var selection = editor.selection;
    var text_content = editor.document.getText(selection.isEmpty ? undefined : selection);
    return vscode.window.showInputBox({ prompt: "Enter the gist description." })
        .then(function (description) { return Gist.create(type, description, path.basename(editor.document.fileName || "untitled.txt"), text_content); })
        .then(function (res) {
        var page = res.body.html_url;
        if (!page) {
            return vscode.window.showErrorMessage(res.body && res.body.message ? res.body.message : "Could not create gist");
        }
        open(page);
    });
}
exports.createGist = createGist;
;
function openGistFile(dir, filename, content) {
    var root = new vscode.Position(0, 0);
    var raw;
    var file = path.join(dir, filename);
    fs.writeFileSync(file, content);
    return vscode.workspace.openTextDocument(file)
        .then(function (doc) { return vscode.window.showTextDocument(doc); });
}
function openFromList(list_promise, tmp_dir_prefix) {
    var gists;
    return list_promise
        .then(function (res) {
        gists = res.body;
        return vscode.window.showQuickPick(gists.map(function (a) { return a.description; }));
    })
        .then(function (description) {
        if (description) {
            return Gist.get(gists.find(function (a) { return a.description === description; }).url)
                .then(function (res) {
                var selected = res.body;
                var tmpdir = tmp.dirSync({ prefix: tmp_dir_prefix + selected.id + "_" });
                var promise;
                if (vscode.window.activeTextEditor) {
                    promise = vscode.commands.executeCommand("workbench.action.closeOtherEditors");
                }
                else {
                    promise = Promise.resolve();
                }
                Object.keys(selected.files).forEach(function (file, idx) {
                    if (idx > 0) {
                        promise = promise
                            .then(function () { return vscode.commands.executeCommand("workbench.action.focusLeftEditor"); })
                            .then(function () { return vscode.commands.executeCommand("workbench.action.splitEditor"); });
                    }
                    promise = promise.then(function () { return openGistFile(tmpdir.name, file, selected.files[file].content); });
                });
                return promise;
            });
        }
    });
}
function getGistDetails(doc) {
    if (doc === void 0) { doc = (vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document : undefined); }
    if (!doc) {
        return undefined;
    }
    var sep = (path.sep === "\\") ? "\\\\" : path.sep;
    var regexp = new RegExp(".*vscode_gist_([^_]*)_[^" + sep + "]*" + sep + "(.*)");
    var matches = doc.fileName.match(regexp);
    if (matches) {
        return {
            path: path.dirname(matches[0]),
            id: matches[1],
            filename: matches[2],
        };
    }
}
function openGist() {
    return openFromList(Gist.list(), 'vscode_gist_');
}
exports.openGist = openGist;
function openStarredGist() {
    return openFromList(Gist.listStarred(), 'vscode_starredgist_');
}
exports.openStarredGist = openStarredGist;
function deleteCurrentGist() {
    var curr_gist = getGistDetails();
    if (!curr_gist) {
        return vscode.window.showErrorMessage("First open a personal gist");
    }
    return Gist.remove(curr_gist.id)
        .then(function () { return vscode.commands.executeCommand("workbench.action.closeAllEditors"); })
        .then(function () { return vscode.window.showInformationMessage("Gist removed."); });
}
exports.deleteCurrentGist = deleteCurrentGist;
function removeFileFromGist() {
    var curr_gist = getGistDetails();
    if (!curr_gist) {
        return vscode.window.showErrorMessage("First open a personal gist");
    }
    return Gist.edit(curr_gist.id, undefined, (_a = {},
        _a[curr_gist.filename] = null,
        _a
    ))
        .then(function () { return vscode.commands.executeCommand("workbench.files.action.closeFile"); })
        .then(function () { return vscode.window.showInformationMessage("File removed from the gist."); });
    var _a;
}
exports.removeFileFromGist = removeFileFromGist;
function addNewFileToGist() {
    var curr_gist = getGistDetails();
    if (!curr_gist) {
        return vscode.window.showErrorMessage("First open a personal gist");
    }
    var file_name;
    return vscode.window.showInputBox({ prompt: "Enter new file name:" })
        .then(function (_name) {
        file_name = _name;
        return vscode.commands.executeCommand("workbench.action.focusLeftEditor");
    })
        .then(function () { return vscode.commands.executeCommand("workbench.action.splitEditor"); })
        .then(function () { return openGistFile(curr_gist.path, file_name, ""); })
        .then(function () { return vscode.window.showInformationMessage("Saving the file will add it to the current gist."); });
}
exports.addNewFileToGist = addNewFileToGist;
function changeGistDescription() {
    var curr_gist = getGistDetails();
    if (!curr_gist) {
        return vscode.window.showErrorMessage("First open a personal gist");
    }
    var file_name;
    return vscode.window.showInputBox({ prompt: "Enter new description:" })
        .then(function (_name) {
        file_name = _name;
        return Gist.edit(curr_gist.id, _name, undefined);
    })
        .then(function () { return vscode.window.showInformationMessage("Gist description updated."); });
}
exports.changeGistDescription = changeGistDescription;
function openGistInBrowser() {
    var curr_gist = getGistDetails();
    if (!curr_gist) {
        return vscode.window.showErrorMessage("First open a personal gist");
    }
    open("https://gist.github.com/" + curr_gist.id);
}
exports.openGistInBrowser = openGistInBrowser;
function onSave(doc) {
    var curr_gist = getGistDetails(doc);
    if (curr_gist) {
        return Gist.edit(curr_gist.id, undefined, (_a = {},
            _a[curr_gist.filename] = {
                content: doc.getText()
            },
            _a
        ))
            .then(function (res) { return vscode.window.showInformationMessage(res.body.message || "Gist files saved."); });
    }
    var _a;
}
exports.onSave = onSave;
//# sourceMappingURL=index.js.map