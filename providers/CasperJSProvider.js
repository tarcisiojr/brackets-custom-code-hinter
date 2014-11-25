define(function (require, exports, module) {
    "use strict";

    var ProjectManager      = brackets.getModule('project/ProjectManager'),
        FileSystem          = brackets.getModule('filesystem/FileSystem'),
        FileUtils           = brackets.getModule('file/FileUtils'),
        DocumentManager     = brackets.getModule('document/DocumentManager'),
        CodeHintManager     = brackets.getModule('editor/CodeHintManager');

    function CasperJSProvider(opts) {
        this.methods;
        this._functionRegExp = /(function\s+([$_A-Za-z\u007F-\uFFFF][$_A-Za-z0-9\u007F-\uFFFF]*)\s*(\([^)]*\)))|(([$_A-Za-z\u007F-\uFFFF][$_A-Za-z0-9\u007F-\uFFFF]*)\s*[:=]\s*function\s*(\([^)]*\)))/g;
        this._opts = opts;
        this._findAllFunctionsInText();
    }

    CasperJSProvider.prototype._findAllFunctionsInText = function () {
        var casperPath = FileSystem.getFileForPath(this._opts.casperjsPath + '/modules/casper.js');

        var _this = this,
            _result;

        FileUtils.readAsText(casperPath).done(function (rawText) {
            _this.methods = _this.findAllFunctionsInText(rawText);
        });
    }

    CasperJSProvider.prototype.findAllFunctionsInText = function (text) {
        var results = {},
            functionName,
            params,
            match;

        //PerfUtils.markStart(PerfUtils.JSUTILS_REGEXP);

        while ((match = this._functionRegExp.exec(text)) !== null) {

            functionName = (match[2] || match[5]).trim();

            if (!Array.isArray(results[functionName])) {

                params = (match[3] || match[6]).trim();

                results[functionName] = {
                    offsetStart: match.index,
                    params: params
                };
            }

        }

        //PerfUtils.addMeasurement(PerfUtils.JSUTILS_REGEXP);

        return results;
    }

    CasperJSProvider.prototype.getRegex = function() {
        return /casper[\.]*/i;
    };

    CasperJSProvider.prototype.getHints = function (line, matchInfo) {
        var token = line.substr(matchInfo.end);

        var hint = [];

        for (var key in this.methods) {
            if (key.indexOf(token) != -1) {
                hint.push({
                    label: key,
                    text: key
                });
            }
        }

        return hint;
    }

    exports.create = CasperJSProvider;
});
