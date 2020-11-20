"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const tmp = require("tmp");
const fs = require("fs");
const path = require("path");
const open = require("open");
class Commands {
    constructor(_codeFileServices, _store) {
        this._codeFileServices = _codeFileServices;
        this._store = _store;
        this._init();
    }
    /**
     * User selects code block from quick pick menu, files open
     */
    openCodeBlock(favorite = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // codeBlock is selected by user
                const codeBlock = yield this._selectCodeBlock(favorite);
                if (!codeBlock) {
                    return;
                }
                const directory = this._createTmpDir(codeBlock.id);
                // Is there an active text editor?
                if (vscode_1.window.activeTextEditor) {
                    // Close it
                    yield vscode_1.commands.executeCommand('workbench.action.closeOtherEditors');
                }
                // Open an editor for each file in CodeFile
                let i = 0;
                for (let fileName in codeBlock.files) {
                    i++;
                    let file = codeBlock.files[fileName];
                    if (i > 1) {
                        yield vscode_1.commands.executeCommand('workbench.action.focusFirstEditorGroup');
                        yield vscode_1.commands.executeCommand('workbench.action.splitEditor');
                    }
                    yield this._openTextDocument(directory, fileName, file.content);
                }
            }
            catch (error) {
                this._showError(error);
            }
        });
    }
    /**
     * User creates a code block from open file or selected text
     * Resulting code block is opened in browser
     */
    createCodeBlock() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const editor = vscode_1.window.activeTextEditor;
                if (!editor) {
                    throw new Error('Open a file before creating');
                }
                let selection = editor.selection;
                let text = editor.document.getText(selection.isEmpty ? undefined : selection);
                let fileName = this._getFileNameFromPath(editor.document.fileName) || 'untitled.txt';
                let description = yield this._prompt('Enter description');
                let isPrivate = (yield this._prompt('Private? Y = Yes, N = No')).substr(0, 1).toLowerCase() === 'y';
                let storageBlock = yield this._provider.createFile(fileName, description, text, isPrivate);
                open(storageBlock.html_url); // launch user's default browser
            }
            catch (error) {
                this._showError(error);
            }
        });
    }
    /**
     * Opens current code block in browser
     */
    openCodeBlockInBrowser() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const details = this._getCurrentDocument();
                const storageBlock = yield this._provider.getStorageBlockById(details.storageBlockId);
                open(storageBlock.html_url); // launch user's default browser
            }
            catch (error) {
                this._showError(error);
            }
        });
    }
    /**
     * Deletes current code block and closes all associated editors
     */
    deleteCodeBlock() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const details = this._getCurrentDocument();
                yield this._provider.deleteStorageBlock(details.storageBlockId);
                const editors = vscode_1.window.visibleTextEditors;
                // close editors associated to this StorageBlock
                for (let e of editors) {
                    let d = this._getCodeFileDetails(e.document);
                    if (d && d.storageBlockId === details.storageBlockId) {
                        vscode_1.commands.executeCommand('workbench.action.closeActiveEditor');
                    }
                }
                this._notify('Block Deleted');
            }
            catch (error) {
                this._showError(error);
            }
        });
    }
    /**
     * Removes file from code block
     */
    removeFileFromCodeBlock() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const details = this._getCurrentDocument();
                yield this._provider.removeFileFromStorageBlock(details.storageBlockId, details.fileName);
                vscode_1.commands.executeCommand('workbench.action.closeActiveEditor');
                this._notify('File Removed From Block');
            }
            catch (error) {
                this._showError(error);
            }
        });
    }
    /**
     * Add a file or selection to existing code block
     * If file already exists we generate new file name (might need to come back to this)
     */
    addToCodeBlock() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const editor = vscode_1.window.activeTextEditor;
                if (!editor) {
                    throw new Error('Open a file before adding');
                }
                const selection = editor.selection;
                const text = editor.document.getText(selection.isEmpty ? undefined : selection);
                let fileName = this._getFileNameFromPath(editor.document.fileName) || 'untitled.txt';
                const codeBlock = yield this._selectCodeBlock();
                if (!codeBlock) {
                    return;
                }
                // check if fileName exists prior to adding new file.
                let i = 1;
                let originalFileName = fileName;
                while (codeBlock.files.hasOwnProperty(fileName)) {
                    let extPos = originalFileName.lastIndexOf('.');
                    if (extPos === -1) {
                        extPos = originalFileName.length;
                    }
                    let ext = originalFileName.substr(extPos);
                    fileName = originalFileName.substring(0, extPos) + i + ext;
                    i++;
                }
                yield this._provider.editFile(codeBlock.id, fileName, text);
                this._notify('File Added To Block');
            }
            catch (error) {
                this._showError(error);
            }
        });
    }
    /**
     * Change code block description
     */
    changeCodeBlockDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const details = this._getCurrentDocument();
                const codeBlock = yield this._provider.getStorageBlockById(details.storageBlockId);
                const description = yield this._prompt('Enter Description', codeBlock.description);
                if (!description) {
                    return;
                }
                yield this._provider.changeDescription(details.storageBlockId, description);
                this._notify('Block Description Saved');
            }
            catch (error) {
                this._showError(error);
            }
        });
    }
    /**
     * User saves a text document
     * @param doc
     */
    onSaveTextDocument(doc) {
        return __awaiter(this, void 0, void 0, function* () {
            const { storageBlockId, fileName } = this._getCodeFileDetails(doc);
            try {
                if (storageBlockId) {
                    yield this._provider.editFile(storageBlockId, fileName, doc.getText());
                    yield this._notify('File Saved To Block');
                }
            }
            catch (error) {
                this._showError(error);
            }
        });
    }
    _getCurrentDocument() {
        const doc = (vscode_1.window.activeTextEditor) ? vscode_1.window.activeTextEditor.document : undefined;
        if (!doc) {
            throw new Error('No open documents');
        }
        const details = this._getCodeFileDetails(doc);
        if (!details) {
            throw new Error(`Not a code block in ${this._provider.name}`);
        }
        return details;
    }
    _getCodeFileDetails(doc) {
        let sep = (path.sep === '\\') ? '\\\\' : path.sep;
        let regexp = new RegExp(`.*vscode_gist_([^_]*)_[^${sep}]*${sep}(.*)`);
        let matches = doc.fileName.match(regexp);
        if (matches) {
            return {
                path: path.dirname(matches[0]),
                storageBlockId: matches[1],
                fileName: matches[2],
            };
        }
    }
    _selectCodeBlock(favorite = false) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._loginUser();
            const files = yield this._provider.list(favorite);
            const selectedFile = yield vscode_1.window.showQuickPick(files);
            if (selectedFile) {
                return this._provider.getStorageBlock(selectedFile.url);
            }
        });
    }
    _createTmpDir(key, options = { prefix: 'vscode_gist_' }) {
        const prefix = options.prefix + key + '_';
        const directory = tmp.dirSync({ prefix });
        return directory.name;
    }
    _openTextDocument(dir, filename, content) {
        return __awaiter(this, void 0, void 0, function* () {
            let file = path.join(dir, filename);
            fs.writeFileSync(file, content);
            return vscode_1.workspace.openTextDocument(file)
                .then((doc) => vscode_1.window.showTextDocument(doc));
        });
    }
    _loginUser() {
        return __awaiter(this, void 0, void 0, function* () {
            const providerName = this._provider.name;
            if (this._provider.isAuthenticated()) {
                return Promise.resolve();
            }
            const username = (yield vscode_1.window.showInputBox({
                prompt: `Enter your ${providerName} username`
            })).trim();
            const password = (yield vscode_1.window.showInputBox({
                prompt: `Enter your ${providerName} password.`
            })).trim();
            yield this._provider.login(username, password);
        });
    }
    _showError(error) {
        let msg;
        if (typeof error === 'string') {
            msg = error;
        }
        else if (error && error.message) {
            msg = error.message;
        }
        else {
            msg = 'An unknown error occurred';
        }
        console.error(error);
        // Prefix message w/ 'GIST ERROR:' so the user knows
        // where the error is coming from.
        vscode_1.window.showErrorMessage(`GIST ERROR: ${msg} [${this._provider.name}]`);
    }
    _prompt(message, value) {
        return vscode_1.window.showInputBox({ prompt: message, value });
    }
    _notify(message) {
        return vscode_1.window.showInformationMessage(`GIST MESSAGE: ${message} [${this._provider.name}]`);
    }
    _getFileNameFromPath(filePath) {
        return path.basename(filePath);
    }
    _setProvider(providerKey) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._store.update('providerKey', providerKey);
            this._provider = this._codeFileServices[providerKey];
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const providerKey = yield this._store.get('providerKey');
            if (providerKey) {
                return this._setProvider(providerKey);
            }
            else if (Object.keys(this._codeFileServices).length === 1) {
                return this._setProvider(Object.keys(this._codeFileServices)[0]);
            }
        });
    }
}
exports.Commands = Commands;
//# sourceMappingURL=commands.js.map