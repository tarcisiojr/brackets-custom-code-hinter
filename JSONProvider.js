define(function (require, exports, module) {
    "use strict";

    function JSONProvider(opts) {
        this.getHints = function (line, implicitChar) {
            return opts.hints;
        };

        this.hasHints = function (line, implicitChar) {
            return line.indexOf('casper') != -1;
        };
    }

    exports.create = JSONProvider;
});
