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

    var providersCache = [];

    /**
     * Inicia os providers registrados no arquivo cch.json.
     *
     * @provider array provider Array com os providers configurados no arquivo cch.json.
     */
    function initProviders(providers) {
        // Nome dos providers.
        var provsNames = providers.map(function(elem) {
            return elem.name;
        });

        // Carregando, via require, os providers e criando uma instancia de execucao de cada.
        require(provsNames, function() {
            Array.prototype.slice.call(arguments, 0).forEach(function(provider, i) {
                console.log(i, providers[i]);

                providersCache.push(new provider.create(providers[i].opts || {}));
            });
        });
    }

    /**
     * Carrega as configuracoes a partir do arquivo cch.json.
     *
     * @param string rawText Conteudo do arquivo cch.json.
     */
    function loadConfigs(rawText) {
        var config = { providers: [] };

        try {
            config = JSON.parse(rawText);

            initProviders(config.providers || []);
        } catch (err) {
            console.error('Err on load config: ' + err);
        }
    }

    /**
     * Realiza a leitura do arquivo de configuracao cch.json e inicia o processo de configuracao.
     */
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

                this.editor = editor;

                var cursor = editor.getCursorPos();

                var lineBeginning = { line: cursor.line, ch: 0 };

                var line = editor.document.getRange(lineBeginning, cursor);

                this.line = line;

                this.providers = providersCache.filter(function(prov) {
                    return prov.hasHints && prov.hasHints(line, implicitChar);
                });

                return this.providers.length > 0;
            },

            getHints: function(implicitChar) {
                if (this.providers.length == 0) {
                    return {};
                }

                var hints = [];

                var line = this.line;

                this.providers.forEach(function(prov) {
                    var provHints = prov.getHints(line, implicitChar);

                    hints.concat(provHints.map(function(hint) {
                        var jqObject = $('<span>' + (hint.label || '') + '</span>');

                        jqObject.data('hint', hint);

                        hints.push(jqObject);
                    }));
                });

                return {
                    hints: hints,
                    match: null,
                    selectInicial: false,
                    handleWideResults: false
                };
            },

            insertHint: function(jqHint) {
                if (!this.editor) {
                    return;
                }

                var cursor = this.editor.getCursorPos();

                var hint = jqHint.data('hint') || {};

                if (hint.text) {
                    this.editor.document.replaceRange(hint.text, cursor);
                }
            }

        }, ["all"], 0);
    });
});
