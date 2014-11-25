/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

// Bracket extension.
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

    var BASE_PROVIDERS = {
        'JSONProvider': true,
        'CasperJSProvider': true
    };

    /**
     * Inicia os providers registrados no arquivo cch.json.
     *
     * @provider array provider Array com os providers configurados no arquivo cch.json.
     */
    function initProviders(providers) {
        var rootPath   = ProjectManager.getProjectRoot().fullPath;

        // Nome dos providers.
        var provsNames = providers.map(function(elem) {
            var name = elem.name;

            if (!BASE_PROVIDERS[name]) {
                name = FileSystem.getFileForPath(rootPath + name + '.js').fullPath;

                return name;
            }

            return 'providers/' + elem.name;
        });

        // Carregando, via require, os providers e criando uma instancia de execucao de cada.
        require(provsNames, function() {
            Array.prototype.slice.call(arguments, 0).forEach(function(provider, i) {
                console.log(i, providers[i]);

                try {
                    providersCache.push(new provider.create(providers[i].opts || {}));
                } catch (err) {
                    console.log('Err loading provider: ', err);
                }
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
        if (doc.file.name == 'cch.json') {
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

                var indexes = [];

                // Verificando os providers que podem fornecere hints.
                this.providers = providersCache.filter(function(prov, i) {
                    if (prov.getRegex && prov.getRegex()) {
                        var regex = new RegExp(prov.getRegex().source, 'g' + (prov.getRegex().ignoreCase ? 'i' : ''));

                        var match = null,
                            lastMatch = null;

                        while (match = regex.exec(line)) {
                            if (match.index == regex.lastIndex) regex.lastIndex++;

                            lastMatch = match;
                        }

                        if (lastMatch && lastMatch.index >= 0) {
                            indexes.push({
                                start:  lastMatch.index,
                                end:    lastMatch.index + lastMatch[0].length,
                                match:  lastMatch[0]
                            });
                        }

                        return lastMatch && lastMatch.index >= 0;
                    }

                    return false;
                });

                this.indexes = indexes;

                return this.providers.length > 0;
            },

            getHints: function(implicitChar) {
                if (this.providers.length == 0) {
                    return {};
                }

                var hints = [];

                var cursor = this.editor.getCursorPos();

                var lineBeginning = { line: cursor.line, ch: 0 };

                var line = this.editor.document.getRange(lineBeginning, cursor);

                var indexes = this.indexes;

                // Obtendo os hints dos providers selecionados.
                this.providers.forEach(function(prov, i) {
                    var provHints = prov.getHints(line, indexes[i]);

                    hints.concat(provHints.map(function(hint) {
                        var jqObject = $('<span>' + (hint.label || '') + '</span>');

                        jqObject.data('hint', hint);
                        jqObject.data('hintIndex', indexes[i]);

                        hints.push(jqObject);
                    }));
                });

                hints.sort(function(jq1, jq2) {
                    var elem1 = jq1.data('hint'),
                        elem2 = jq2.data('hint');

                    return elem1.text > elem2.text ? 1 : elem1.text < elem2.text ? -1 : 0;
                });

                return {
                    hints: hints,
                    match: null,
                    selectInicial: true,
                    handleWideResults: true
                };
            },

            insertHint: function(jqHint) {
                if (!this.editor) {
                    return;
                }

                var start = this.editor.getCursorPos();
                var end   = this.editor.getCursorPos();

                var hint = jqHint.data('hint') || {};
                var hintIndex = jqHint.data('hintIndex');

                start.ch = hintIndex.end;

                if (hint.text) {
                    // Inserindo o texto do hint.
                    this.editor.document.replaceRange(hint.text, start, end);
                }
            }

        }, [ "all" ], 2);
    });
});
