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
const github = require("github");
class GistService {
    constructor(_store, debug = false, _tokenKey = 'gisttoken') {
        this._store = _store;
        this._tokenKey = _tokenKey;
        this.name = 'github';
        this.gh = new github({ debug, headers: { 'user-agent': 'VSCode-Gist-Extension' } });
        this._getToken();
    }
    isAuthenticated() {
        return !!(this._token);
    }
    login(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._authenticate(username, password);
            yield this._createToken();
        });
    }
    _authenticate(username, password) {
        const auth = { username, password, type: 'basic' };
        this.gh.authenticate(auth);
        return Promise.resolve();
    }
    _createToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (yield this.gh.authorization.create({
                scopes: ['gist'],
                note: `vscode-gist extension :: ${new Date().toISOString()}`
            })).data;
            let token = data.token;
            return this.setToken(token);
        });
    }
    _getToken() {
        if (!this._token) {
            return this.setToken(this._store.get(this._tokenKey)).then(() => this._getToken());
        }
        return Promise.resolve(this._token);
    }
    // This will eventually become private when `gist.oauth_token` is removed.
    setToken(token) {
        this._token = token;
        if (this._token) {
            this.gh.authenticate({ type: 'token', token });
        }
        return this._store.update(this._tokenKey, token);
    }
    list(favorite = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {};
            const gists = (yield (favorite ? this.gh.gists.getStarred(options) : this.gh.gists.getAll(options))).data;
            gists.forEach(g => {
                let label = g.description || `No Name: ${g.id}`;
                g.label = label;
            });
            return gists;
        });
    }
    getStorageBlock(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = url.split('/').pop();
            return this.getStorageBlockById(id);
        });
    }
    getStorageBlockById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const gist = (yield this.gh.gists.get({ id })).data;
            return gist;
        });
    }
    deleteStorageBlock(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.gh.gists.delete({ id });
            }
            catch (error) {
                console.error(error);
                throw new Error('Unable to delete');
            }
        });
    }
    removeFileFromStorageBlock(id, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const files = { [fileName]: null };
                this.gh.gists.edit({ id, files: JSON.stringify(files) });
            }
            catch (error) {
                console.error(error);
                throw new Error('Unable to remove file');
            }
        });
    }
    createFile(fileName, description, text, isPrivate = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = { [fileName]: { content: text } };
            let response = yield this.gh.gists.create({ description, files: JSON.stringify(files), public: !isPrivate });
            let gist = (response && response.data) ? response.data : undefined;
            if (!gist) {
                throw new Error('Gist not created');
            }
            return gist;
        });
    }
    editFile(gistId, fileName, text) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = { [fileName]: { content: text } };
            return yield this.gh.gists.edit({ id: gistId, files: JSON.stringify(files) });
        });
    }
    changeDescription(gistId, description) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.gh.gists.edit({ id: gistId, description, files: JSON.stringify({}) });
        });
    }
}
exports.GistService = GistService;
//# sourceMappingURL=gist.service.js.map