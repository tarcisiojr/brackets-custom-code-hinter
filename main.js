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


    //var p = require('JSONProvider');

    function initProviders(providers) {

        for (var i = 0; i < providers.length; i++) {
            try {
                var provider = require([providers[i].name], function() {
                    console.log('ola', arguments);
                });
            } catch (err) {
                console.error('Provider not found: ' + err);
            }
        }

        console.log(providers);
    }

    function loadConfigs(rawText) {
        var config = { providers: [] };

        try {
            config = JSON.parse(rawText);

            initProviders(config.providers || []);
        } catch (err) {
            console.error('Err on load config: ' + err);
        }
    }

    function readConfigFile() {
        var rootPath   = ProjectManager.getProjectRoot().fullPath,
            cmdCfgFile = FileSystem.getFileForPath(rootPath + 'cch.json');

        FileUtils.readAsText(cmdCfgFile).done(function (rawText) {
            loadConfigs(rawText);
        });
    }

    $(ProjectManager).on('projectOpen projectRefresh', readConfigFile);
    $(DocumentManager).on('documentSaved', function(evt, doc) {
        if (doc.file.name == 'cmdrunner.json') {
            readConfigFile();
        }
    });


    AppInit.appReady(function () {
        CodeHintManager.registerHintProvider({
            hasHints: function(editor, implicitChar) {
                if (implicitChar !== '.') {
                    return false;
                }

                this.editor = editor;

                var cursor = editor.getCursorPos();

                var lineBeginning = { line: cursor.line, ch: 0 };

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
                        "funcao d",
                        "fyuasd e"
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

                var cursor = this.editor.getCursorPos();

                this.editor.document.replaceRange(hint, cursor);
            }

        }, ["all"], 0);
    });
});
