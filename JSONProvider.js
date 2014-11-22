define(function (require, exports, module) {
    "use strict";

    function JSONProvider(opts) {
        this.getHints = function (line, implicitChar) {
            return [{
                    label: 'aaa',
                    text: 'aaa'
                },
                {
                    label: 'aaab',
                    text: 'aaab'
                }
            ];
        };

        this.hasHints = function (line, implicitChar) {
            return line.indexOf('casper') != -1;
        };
    }

    exports.create = JSONProvider;
});
