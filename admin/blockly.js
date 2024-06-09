'use strict';

if (typeof goog === 'undefined') {
    goog.provide('Blockly.JavaScript.Sendto');

    goog.require('Blockly.JavaScript');
}

Blockly.Translate = Blockly.Translate || function (word, lang) {
    lang = lang || systemLang;
    if (Blockly.Words && Blockly.Words[word]) {
        return Blockly.Words[word][lang] || Blockly.Words[word].en;
    } else {
        return word;
    }
};

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
    '<block type="email">' +
    '  <field name="INSTANCE"></field>' +
    '  <field name="IS_HTML">FALSE</field>' +
    '  <field name="LOG"></field>' +
    '  <value name="TO">' +
    '    <shadow type="text">' +
    '      <field name="TEXT">user@domain.tld</field>' +
    '    </shadow>' +
    '  </value>' +
    '  <value name="TEXT">' +
    '    <shadow type="text">' +
    '      <field name="TEXT"></field>' +
    '    </shadow>' +
    '  </value>' +
    '  <value name="SUBJECT">' +
    '    <shadow type="text">' +
    '      <field name="TEXT"></field>' +
    '    </shadow>' +
    '  </value>' +
    '</block>';

Blockly.Blocks['email'] = {
    init: function() {
        const options = [[Blockly.Translate('email_anyInstance'), '']];
        if (typeof main !== 'undefined' && main.instances) {
            for (let i = 0; i < main.instances.length; i++) {
                const m = main.instances[i].match(/^system.adapter.email.(\d+)$/);
                if (m) {
                    const k = parseInt(m[1], 10);
                    options.push(['email.' + k, '.' + k]);
                }
            }
            if (options.length === 0) {
                for (let u = 0; u <= 4; u++) {
                    options.push(['email.' + u, '.' + u]);
                }
            }
        } else {
            for (let n = 0; n <= 4; n++) {
                options.push(['email.' + n, '.' + n]);
            }
        }

        this.appendDummyInput('INSTANCE')
            .appendField(Blockly.Translate('email'))
            .appendField(new Blockly.FieldDropdown(options), 'INSTANCE');

        this.appendValueInput('TO')
            .appendField(Blockly.Translate('email_to'));

        this.appendDummyInput('IS_HTML')
            .appendField(Blockly.Translate('email_is_html'))
            .appendField(new Blockly.FieldCheckbox('FALSE'), 'IS_HTML');

        this.appendValueInput('TEXT')
            .setCheck('String')
            .appendField(Blockly.Translate('email_text'));

        const inputSubject = this.appendValueInput('SUBJECT')
            .setCheck('String')
            .appendField(Blockly.Translate('email_subject'));
        if (inputSubject.connection) {
            inputSubject.connection._optional = true;
        }

        const inputFrom = this.appendValueInput('FROM')
            .setCheck('String')
            .appendField(Blockly.Translate('email_from'));
        if (inputFrom.connection) {
            inputFrom.connection._optional = true;
        }

        const inputFile1 = this.appendValueInput('FILE_1')
            .setCheck('String')
            .appendField(Blockly.Translate('email_file'));
        if (inputFile1.connection) {
            inputFile1.connection._optional = true;
        }

        const inputFile2 = this.appendValueInput('FILE_2')
            .setCheck('String')
            .appendField(Blockly.Translate('email_file'));
        if (inputFile2.connection) {
            inputFile2.connection._optional = true;
        }

        this.appendDummyInput('LOG')
            .appendField(Blockly.Translate('email_log'))
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Translate('email_log_none'),  ''],
                [Blockly.Translate('email_log_debug'), 'debug'],
                [Blockly.Translate('email_log_info'),  'log'],
                [Blockly.Translate('email_log_warn'),  'warn'],
                [Blockly.Translate('email_log_error'), 'error'],
            ]), 'LOG');

        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);

        this.setColour(Blockly.Sendto.HUE);
        this.setTooltip(Blockly.Translate('email_tooltip'));
        this.setHelpUrl(Blockly.Translate('email_help'));
    },
};

Blockly.JavaScript['email'] = function(block) {
    const dropdown_instance = block.getFieldValue('INSTANCE');
    const logLevel = block.getFieldValue('LOG');
    const message  = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_ATOMIC);
    const isHtml = block.getFieldValue('IS_HTML');

    let text = '{\n';
    if (isHtml === 'TRUE') {
        text += `  html: ${message},\n`;
    } else {
        text += `  text: ${message},\n`;
    }

    const to = Blockly.JavaScript.valueToCode(block, 'TO', Blockly.JavaScript.ORDER_ATOMIC);
    if (to) {
        text += `  to: ${to},\n`;
    }

    const subject = Blockly.JavaScript.valueToCode(block, 'SUBJECT', Blockly.JavaScript.ORDER_ATOMIC);
    if (subject && subject !== '') {
        text += `  subject: ${subject},\n`;
    }

    const from = Blockly.JavaScript.valueToCode(block, 'FROM', Blockly.JavaScript.ORDER_ATOMIC);
    if (from) {
        text += `  from: ${from},\n`;
    }

    const files = [];

    files.push(Blockly.JavaScript.valueToCode(block, 'FILE_1', Blockly.JavaScript.ORDER_ATOMIC));
    files.push(Blockly.JavaScript.valueToCode(block, 'FILE_2', Blockly.JavaScript.ORDER_ATOMIC));

    let attachments = '';
    for (let f = 0; f < files.length; f++) {
        if (files[f]) {
            if (!attachments) {
                attachments = '  attachments:[\n';
            }

            attachments += `    { path: ${files[f]}, cid: 'file${f + 1}' },\n`;
        }
    }
    if (attachments) {
        attachments += '  ],\n';
    }
    text += attachments;
    text += '}';

    let logText = '';
    if (logLevel) {
        logText = `console.${logLevel}('email: ' + ${message});\n`;
    }

    return `sendTo('email${dropdown_instance}', 'send', ${text});\n${logText}`;
};
