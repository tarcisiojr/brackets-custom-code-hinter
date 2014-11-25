define(function (require, exports, module) {
    "use strict";

    function JSONProvider(opts) {
        this.getHints = function (line, implicitChar) {
            var hints = opts.hints || [];

            var retHints = [];

            hints.forEach(function(elem) {
                if (typeof elem === 'string') {
                    retHints.push({label: elem, text: elem });

                } else if (typeof elem === 'object') {
                    var label = elem.label || null;
                    var text  = elem.text  || label;

                    if (label) {
                        retHints.push({label: label, text: text });
                    }
                }
            });

            return retHints;
        };

        this.getRegex = function (line, implicitChar) {
            return new RegExp(opts.regex || "[a-z0-9]\\.", opts.flags || "ig");
        };
    }

    exports.create = JSONProvider;
});
