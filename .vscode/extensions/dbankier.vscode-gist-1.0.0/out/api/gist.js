"use strict";
var auth = require("./auth");
var request = require("bluebird").promisify(require("request"));
var api = "https://api.github.com";
var Type;
(function (Type) {
    Type[Type["PRIVATE"] = 0] = "PRIVATE";
    Type[Type["PUBLIC"] = 1] = "PUBLIC";
    Type[Type["ANONYMOUS"] = 2] = "ANONYMOUS";
})(Type || (Type = {}));
function send(method, path, auth_type, body) {
    var oauth = auth.getToken();
    var promise = auth_type !== Type.ANONYMOUS && !oauth ? auth.getCredentials() : Promise.resolve();
    return promise.then(function (creds) {
        console.log(creds);
        var options = {
            method: method,
            uri: path.indexOf("http") === 0 ? path : api + path,
            json: true,
            headers: {
                "User-Agent": "VSCode-Gist-Extention"
            },
            auth: undefined,
            body: body
        };
        if (auth_type !== Type.ANONYMOUS) {
            if (oauth) {
                options.headers["Authorization"] = "token " + oauth;
            }
            else {
                options.auth = creds;
            }
        }
        return request(options);
    });
}
module.exports = {
    Type: Type,
    create: function (type, description, file_name, text_content) {
        var body = {
            description: description,
            public: type !== Type.PRIVATE,
            files: {}
        };
        body.files[file_name] = {
            content: text_content
        };
        return send("POST", "/gists", type, body);
    },
    list: function () { return send("GET", "/gists"); },
    listUser: function (user) { return send("GET", "/users/" + user + "/gists"); },
    listStarred: function () { return send("GET", "/gists/starred"); },
    listPublic: function () { return send("GET", "/gists/public"); },
    get: function (url) { return send("GET", url); },
    remove: function (id) { return send("DELETE", "/gists/" + id); },
    getRevision: function (id, sha) { return send("GET", "/gist/" + id + "/" + sha); },
    getCommits: function (id) { return send("GET", "gists/" + id + "/commits"); },
    edit: function (id, description, files) {
        return send("PATCH", "/gists/" + id, undefined, {
            description: description,
            files: files
        });
    },
    star: function (id) { return send("PUT", "/gist/" + id + "/star"); },
    unstar: function (id) { return send("DELETE", "/gist/" + id + "/star"); },
    isStarred: function (id) { return send("GET", "/gist/" + id + "/star"); },
    fork: function (id) { return send("POST", "/gist/" + id + "/forks"); },
    listForks: function (id) { return send("GET", "/gist/" + id + "/forks"); }
};
//# sourceMappingURL=gist.js.map