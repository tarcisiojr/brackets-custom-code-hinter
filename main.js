/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

// Bracket extension. Permite que o desenvolvedor crie atalhos para os comandos de console.
define(function (require, exports, module) {
    "use strict";

    var AppInit             = brackets.getModule('utils/AppInit'),
        ExtensionUtils      = brackets.getModule('utils/ExtensionUtils'),
        NodeConnection      = brackets.getModule('utils/NodeConnection'),
        NodeDomain          = brackets.getModule('utils/NodeDomain'),
        CommandManager      = brackets.getModule('command/CommandManager'),
        KeyBindingManager   = brackets.getModule('command/KeyBindingManager'),
        Menus               = brackets.getModule('command/Menus'),
        QuickOpen           = brackets.getModule('search/QuickOpen'),
        ProjectManager      = brackets.getModule('project/ProjectManager'),
        StatusBar           = brackets.getModule('widgets/StatusBar'),
        FileSystem          = brackets.getModule('filesystem/FileSystem'),
        FileUtils           = brackets.getModule('file/FileUtils'),
        PanelManager        = brackets.getModule('view/PanelManager'),
        Resizer             = brackets.getModule('utils/Resizer'),
        DocumentManager     = brackets.getModule('document/DocumentManager'),
        CodeHintManager     = brackets.getModule('editor/CodeHintManager');


    AppInit.appReady(function () {
        CodeHintManager.registerHintProvider({
            hasHints: function(editor, implicitChar) {
                if (implicitChar !== '.') {
                    return false;
                }

                this.editor = editor;

                var cursor = editor.getCursorPos();

                var lineBeginning = { line: cursor.line, ch: 0};

                var textBeforeCursor = editor.document.getRange(lineBeginning, cursor);

                console.log(textBeforeCursor.match(/casper[\.]*/i));

                return textBeforeCursor.match(/casper[\.]*/i);
            },

            getHints: function() {
                return {
                    hints: [
                        "aaaa",
                        "funcao a",
                        "funcao b",
                        "funcao c",
                        "funcao d"
                    ],
                    match: 'a',
                    selectInicial: false,
                    handleWideResults: false
                };
            },

            insertHint: function(hint) {
                if (!this.editor) {
                    return;
                }

                var cursor = editor.getCursorPos();

                //this.editor.
            }

        }, ["all"], 0);
    });
});
