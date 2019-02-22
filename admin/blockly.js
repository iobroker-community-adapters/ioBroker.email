'use strict';

goog.provide('Blockly.JavaScript.Sendto');

goog.require('Blockly.JavaScript');

// --- SendTo email --------------------------------------------------
Blockly.Words['email']               = {"en": "email",                                           "de": "email",                                           "ru": "email",                                           "pt": "e-mail",                                          "nl": "e-mail",                                          "fr": "e-mail",                                          "it": "email",                                           "es": "correo electrónico",                              "pl": "e-mail",                                          "zh-cn": "电子邮件"};
Blockly.Words['email_to']            = {"en": "to",                                              "de": "An",                                              "ru": "кому",                                            "pt": "para",                                            "nl": "naar",                                            "fr": "pour",                                            "it": "per",                                             "es": "a",                                               "pl": "dla",                                             "zh-cn": "要"};
Blockly.Words['email_text']          = {"en": "text",                                            "de": "Text",                                            "ru": "сообщение",                                       "pt": "texto",                                           "nl": "tekst",                                           "fr": "texte",                                           "it": "testo",                                           "es": "texto",                                           "pl": "tekst",                                           "zh-cn": "文本"};
Blockly.Words['email_subject']       = {"en": "subject (optional)",                              "de": "Betreff (optional)",                              "ru": "заголовок (не обяз.)",                            "pt": "assunto (opcional)",                              "nl": "onderwerp (optioneel)",                           "fr": "objet (facultatif)",                              "it": "oggetto (facoltativo)",                           "es": "tema (opcional)",                                 "pl": "temat (opcjonalnie)",                             "zh-cn": "主题(可选)"};
Blockly.Words['email_from']          = {"en": "from (optional)",                                 "de": "Von (optional)",                                  "ru": "от (не обяз.)",                                   "pt": "(opcional)",                                      "nl": "uit (optioneel)",                                 "fr": "à partir de (facultatif)",                        "it": "(opzionale)",                                     "es": "(opcional)",                                      "pl": "z (opcjonalnie)",                                 "zh-cn": "从(可选)"};
Blockly.Words['email_is_html']       = {"en": "Send as HTML",                                    "de": "Sende als HTML",                                  "ru": "Формат HTML",                                     "pt": "Como enviar HTML",                                "nl": "Versturen als HTML",                              "fr": "Envoyer au format HTML",                          "it": "Invia come HTML",                                 "es": "Enviar como HTML",                                "pl": "Wyślij jako HTML",                                "zh-cn": "发送HTML"};

Blockly.Words['email_log']           = {"en": "log level",                                       "de": "Loglevel",                                        "ru": "Протокол",                                        "pt": "o nível de log de",                               "nl": "log-niveau",                                      "fr": "le niveau de journal",                            "it": "il livello di log",                               "es": "nivel de registro",                               "pl": "poziom dziennika ",                               "zh-cn": "日志的水平"};
Blockly.Words['email_log_none']      = {"en": "none",                                            "de": "keins",                                           "ru": "нет",                                             "pt": "nenhum",                                          "nl": "geen",                                            "fr": "aucun",                                           "it": "nessuno",                                         "es": "ninguno",                                         "pl": "nikt",                                            "zh-cn": "没有"};
Blockly.Words['email_log_info']      = {"en": "info",                                            "de": "info",                                            "ru": "инфо",                                            "pt": "informações",                                     "nl": "info",                                            "fr": "info",                                            "it": "info",                                            "es": "info",                                            "pl": "informacje",                                      "zh-cn": "的信息"};
Blockly.Words['email_log_debug']     = {"en": "debug",                                           "de": "debug",                                           "ru": "debug",                                           "pt": "depurar",                                         "nl": "debug",                                           "fr": "debug",                                           "it": "debug",                                           "es": "depurar",                                         "pl": "debugować",                                       "zh-cn": "调试"};
Blockly.Words['email_log_warn']      = {"en": "warning",                                         "de": "warning",                                         "ru": "warning",                                         "pt": "aviso",                                           "nl": "waarschuwing",                                    "fr": "avertissement",                                   "it": "avviso",                                          "es": "advertencia",                                     "pl": "ostrzeżenie",                                     "zh-cn": "警告"};
Blockly.Words['email_log_error']     = {"en": "error",                                           "de": "error",                                           "ru": "ошибка",                                          "pt": "erro",                                            "nl": "fout",                                            "fr": "erreur",                                          "it": "errore",                                          "es": "error",                                           "pl": "błąd",                                            "zh-cn": "错误"};

Blockly.Words['email_file']          = {"en": "file name (optional)",                            "de": "Dateiname (optional)",                            "ru": "имя файла (не обяз.)",                            "pt": "nome do arquivo (opcional)",                      "nl": "bestand (optioneel)",                             "fr": "nom de fichier (facultatif)",                     "it": "il nome del file (opzionale)",                    "es": "nombre de archivo (opcional)",                    "pl": "nazwa pliku (opcjonalnie)",                       "zh-cn": "文件名(可选)"};

Blockly.Words['email_anyInstance']   = {"en": "all instances",                                   "de": "Alle Instanzen",                                  "ru": "На все драйвера",                                 "pt": "todas as instâncias",                             "nl": "alle exemplaren",                                 "fr": "toutes les instances",                            "it": "tutte le istanze",                                "es": "todas las instancias",                            "pl": "wszystkie wystąpienia",                           "zh-cn": "所有实例"};
Blockly.Words['email_tooltip']       = {"en": "Send an email",                                   "de": "Sende ein E-Mail",                                "ru": "Послать email",                                   "pt": "Envie um e-mail",                                 "nl": "Stuur een e-mail",                                "fr": "Envoyer un e-mail",                               "it": "Inviare una mail",                                "es": "Enviar un correo electrónico",                    "pl": "Wyślij e-mail",                                   "zh-cn": "发送电子邮件"};
Blockly.Words['email_help']          = {"en": "https://github.com/ioBroker/ioBroker.email/blob/master/README.md", "de": "https://github.com/ioBroker/ioBroker.email/blob/master/README.md", "ru": "https://github.com/ioBroker/ioBroker.email/blob/master/README.md", "pt": "https://github.com/ioBroker/ioBroker.email/blob/master/README.md", "nl": "https://github.com/ioBroker/ioBroker.email/blob/master/README.md", "fr": "https://github.com/ioBroker/ioBroker.email/blob/master/README.md", "it": "https://github.com/ioBroker/ioBroker.email/blob/master/README.md", "es": "https://github.com/ioBroker/ioBroker.email/blob/master/README.md", "pl": "https://github.com/ioBroker/ioBroker.email/blob/master/README.md", "zh-cn": "https://github.com/ioBroker/ioBroker.email/blob/master/README.md"};


Blockly.Sendto.blocks['email'] =
    '<block type="email">'
    + '     <value name="INSTANCE">'
    + '     </value>'
    + '     <value name="TO">'
    + '         <shadow type="text">'
    + '             <field name="TO_TEXT">text</field>'
    + '         </shadow>'
    + '     </value>'
    + '     <value name="IS_HTML">'
    + '     </value>'
    + '     <value name="TEXT">'
    + '         <shadow type="text">'
    + '             <field name="TEXT_TEXT">text</field>'
    + '         </shadow>'
    + '     </value>'
    + '     <value name="SUBJECT">'
    + '         <shadow type="text">'
    + '             <field name="SUBJECT_TEXT">text</field>'
    + '         </shadow>'
    + '     </value>'
    + '     <value name="FROM">'
    + '     </value>'
    + '     <value name="FILE_1">'
    + '     </value>'
    + '     <value name="FILE_2">'
    + '     </value>'
    + '     <value name="LOG">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['email'] = {
    init: function() {

        this.appendDummyInput("INSTANCE")
            .appendField(Blockly.Words['email'][systemLang])
            .appendField(new Blockly.FieldDropdown([[Blockly.Words['email_anyInstance'][systemLang], ""], ["email.0", ".0"], ["email.1", ".1"], ["email.2", ".2"], ["email.3", ".3"], ["email.4", ".4"]]), "INSTANCE");

        this.appendValueInput("TO")
            .appendField(Blockly.Words['email_to'][systemLang]);

        this.appendDummyInput("IS_HTML")
            .appendField(Blockly.Words['email_is_html'][systemLang])
            .appendField(new Blockly.FieldCheckbox('FALSE'), 'IS_HTML');

        this.appendValueInput('TEXT')
            .setCheck('String')
            .appendField(Blockly.Words['email_text'][systemLang]);

        var input = this.appendValueInput("SUBJECT")
            .setCheck('String')
            .appendField(Blockly.Words['email_subject'][systemLang]);
        if (input.connection) input.connection._optional = true;

        input = this.appendValueInput("FROM")
            .setCheck('String')
            .appendField(Blockly.Words['email_from'][systemLang]);
        if (input.connection) input.connection._optional = true;

        input = this.appendValueInput("FILE_1")
            .setCheck('String')
            .appendField(Blockly.Words['email_file'][systemLang]);
        if (input.connection) input.connection._optional = true;

        input = this.appendValueInput("FILE_2")
            .setCheck('String')
            .appendField(Blockly.Words['email_file'][systemLang]);
        if (input.connection) input.connection._optional = true;

        this.appendDummyInput('LOG')
            .appendField(Blockly.Words['email_log'][systemLang])
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Words['email_log_none'][systemLang],  ''],
                [Blockly.Words['email_log_info'][systemLang],  'log'],
                [Blockly.Words['email_log_debug'][systemLang], 'debug'],
                [Blockly.Words['email_log_warn'][systemLang],  'warn'],
                [Blockly.Words['email_log_error'][systemLang], 'error']
            ]), 'LOG');

        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);

        this.setColour(Blockly.Sendto.HUE);
        this.setTooltip(Blockly.Words['email_tooltip'][systemLang]);
        this.setHelpUrl(Blockly.Words['email_help'][systemLang]);
    }
};

Blockly.JavaScript['email'] = function(block) {
    var dropdown_instance = block.getFieldValue('INSTANCE');
    var logLevel = block.getFieldValue('LOG');
    var message  = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_ATOMIC);
    var isHtml = block.getFieldValue('IS_HTML');

    var text = '{\n';
    if (isHtml === 'TRUE') {
        text += '   html: ' + message + ',\n';
    } else {
        text += '   text: ' + message + ',\n';
    }

    var value = Blockly.JavaScript.valueToCode(block, 'TO', Blockly.JavaScript.ORDER_ATOMIC);
    if (value)     text += '   to: ' + value + ',\n';

    value = Blockly.JavaScript.valueToCode(block, 'SUBJECT', Blockly.JavaScript.ORDER_ATOMIC);
    if (value && value !== '') text += '   subject: ' + value + ',\n';

    value = Blockly.JavaScript.valueToCode(block, 'FROM', Blockly.JavaScript.ORDER_ATOMIC);
    if (value)     text += '   from: ' + value + ',\n';

    var files = [];

    files.push(Blockly.JavaScript.valueToCode(block, 'FILE_1', Blockly.JavaScript.ORDER_ATOMIC));
    files.push(Blockly.JavaScript.valueToCode(block, 'FILE_2', Blockly.JavaScript.ORDER_ATOMIC));
    var attachments = '';
    for (var f = 0; f < files.length; f++) {
        if (files[f]) {
            if (!attachments) attachments = '   attachments:[\n';
            attachments += '      {path: ' + files[f] + ', cid: "file' + (f + 1) + '"},\n';
        }
    }
    if (attachments) attachments += '    ],\n';
    text += attachments;

    text = text.substring(0, text.length - 2);
    text += '\n';

    text += '}';
    var logText;

    if (logLevel) {
        logText = 'console.' + logLevel + '("email: " + ' + message + ');\n'
    } else {
        logText = '';
    }

    return 'sendTo("email' + dropdown_instance + '", "send", ' + text + ');\n' + logText;
};
