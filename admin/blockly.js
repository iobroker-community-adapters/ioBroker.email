// GENERATED FILE - do not edit.
// Source: src-blockly/blockly.ts - rebuild with `npm run build:blockly`.
"use strict";
(() => {
  // src-blockly/icons.ts
  function dataUri(svg) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }
  var PLUS_IMAGE = dataUri(
    '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15"><circle cx="7.5" cy="7.5" r="7.5" fill="#5ba3f5"/><path d="M4 7.5h7M7.5 4v7" stroke="#fff" stroke-width="2"/></svg>'
  );
  var MINUS_IMAGE = dataUri(
    '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15"><circle cx="7.5" cy="7.5" r="7.5" fill="#e57373"/><path d="M4 7.5h7" stroke="#fff" stroke-width="2"/></svg>'
  );

  // src-blockly/i18n/de.json
  var de_default = {
    email: "email",
    email_anyInstance: "Alle Instanzen",
    email_file: "Dateiname (optional)",
    email_from: "Von (optional)",
    email_is_html: "Sende als HTML",
    email_log: "Loglevel",
    email_log_debug: "debug",
    email_log_error: "error",
    email_log_info: "info",
    email_log_none: "keins",
    email_log_warn: "warning",
    email_subject: "Betreff (optional)",
    email_text: "Text",
    email_to: "An",
    email_tooltip: "Sende ein E-Mail"
  };

  // src-blockly/i18n/en.json
  var en_default = {
    email: "email",
    email_anyInstance: "all instances",
    email_file: "file name (optional)",
    email_from: "from (optional)",
    email_is_html: "Send as HTML",
    email_log: "log level",
    email_log_debug: "debug",
    email_log_error: "error",
    email_log_info: "info",
    email_log_none: "none",
    email_log_warn: "warning",
    email_subject: "subject (optional)",
    email_text: "text",
    email_to: "to",
    email_tooltip: "Send an email"
  };

  // src-blockly/i18n/es.json
  var es_default = {
    email: "correo electrónico",
    email_anyInstance: "todas las instancias",
    email_file: "nombre de archivo (opcional)",
    email_from: "(opcional)",
    email_is_html: "Enviar como HTML",
    email_log: "nivel de registro",
    email_log_debug: "depurar",
    email_log_error: "error",
    email_log_info: "info",
    email_log_none: "ninguno",
    email_log_warn: "advertencia",
    email_subject: "tema (opcional)",
    email_text: "texto",
    email_to: "a",
    email_tooltip: "Enviar un correo electrónico"
  };

  // src-blockly/i18n/fr.json
  var fr_default = {
    email: "e-mail",
    email_anyInstance: "toutes les instances",
    email_file: "nom de fichier (facultatif)",
    email_from: "à partir de (facultatif)",
    email_is_html: "Envoyer au format HTML",
    email_log: "le niveau de journal",
    email_log_debug: "debug",
    email_log_error: "erreur",
    email_log_info: "info",
    email_log_none: "aucun",
    email_log_warn: "avertissement",
    email_subject: "objet (facultatif)",
    email_text: "texte",
    email_to: "pour",
    email_tooltip: "Envoyer un e-mail"
  };

  // src-blockly/i18n/it.json
  var it_default = {
    email: "email",
    email_anyInstance: "tutte le istanze",
    email_file: "il nome del file (opzionale)",
    email_from: "(opzionale)",
    email_is_html: "Invia come HTML",
    email_log: "il livello di log",
    email_log_debug: "debug",
    email_log_error: "errore",
    email_log_info: "info",
    email_log_none: "nessuno",
    email_log_warn: "avviso",
    email_subject: "oggetto (facoltativo)",
    email_text: "testo",
    email_to: "per",
    email_tooltip: "Inviare una mail"
  };

  // src-blockly/i18n/nl.json
  var nl_default = {
    email: "e-mail",
    email_anyInstance: "alle exemplaren",
    email_file: "bestand (optioneel)",
    email_from: "uit (optioneel)",
    email_is_html: "Versturen als HTML",
    email_log: "log-niveau",
    email_log_debug: "debug",
    email_log_error: "fout",
    email_log_info: "info",
    email_log_none: "geen",
    email_log_warn: "waarschuwing",
    email_subject: "onderwerp (optioneel)",
    email_text: "tekst",
    email_to: "naar",
    email_tooltip: "Stuur een e-mail"
  };

  // src-blockly/i18n/pl.json
  var pl_default = {
    email: "e-mail",
    email_anyInstance: "wszystkie wystąpienia",
    email_file: "nazwa pliku (opcjonalnie)",
    email_from: "z (opcjonalnie)",
    email_is_html: "Wyślij jako HTML",
    email_log: "poziom dziennika ",
    email_log_debug: "debugować",
    email_log_error: "błąd",
    email_log_info: "informacje",
    email_log_none: "nikt",
    email_log_warn: "ostrzeżenie",
    email_subject: "temat (opcjonalnie)",
    email_text: "tekst",
    email_to: "dla",
    email_tooltip: "Wyślij e-mail"
  };

  // src-blockly/i18n/pt.json
  var pt_default = {
    email: "e-mail",
    email_anyInstance: "todas as instâncias",
    email_file: "nome do arquivo (opcional)",
    email_from: "(opcional)",
    email_is_html: "Como enviar HTML",
    email_log: "o nível de log de",
    email_log_debug: "depurar",
    email_log_error: "erro",
    email_log_info: "informações",
    email_log_none: "nenhum",
    email_log_warn: "aviso",
    email_subject: "assunto (opcional)",
    email_text: "texto",
    email_to: "para",
    email_tooltip: "Envie um e-mail"
  };

  // src-blockly/i18n/ru.json
  var ru_default = {
    email: "email",
    email_anyInstance: "На все драйвера",
    email_file: "имя файла (не обяз.)",
    email_from: "от (не обяз.)",
    email_is_html: "Формат HTML",
    email_log: "Протокол",
    email_log_debug: "debug",
    email_log_error: "ошибка",
    email_log_info: "инфо",
    email_log_none: "нет",
    email_log_warn: "warning",
    email_subject: "заголовок (не обяз.)",
    email_text: "сообщение",
    email_to: "кому",
    email_tooltip: "Послать email"
  };

  // src-blockly/i18n/zh-cn.json
  var zh_cn_default = {
    email: "电子邮件",
    email_anyInstance: "所有实例",
    email_file: "文件名(可选)",
    email_from: "从(可选)",
    email_is_html: "发送HTML",
    email_log: "日志的水平",
    email_log_debug: "调试",
    email_log_error: "错误",
    email_log_info: "的信息",
    email_log_none: "没有",
    email_log_warn: "警告",
    email_subject: "主题(可选)",
    email_text: "文本",
    email_to: "要",
    email_tooltip: "发送电子邮件"
  };

  // src-blockly/words.ts
  var Blockly = window.Blockly;
  var LANGUAGES = {
    de: de_default,
    en: en_default,
    es: es_default,
    fr: fr_default,
    it: it_default,
    nl: nl_default,
    pl: pl_default,
    pt: pt_default,
    ru: ru_default,
    "zh-cn": zh_cn_default
  };
  function installWords() {
    Blockly.Translate || (Blockly.Translate = function(word, lang) {
      lang || (lang = window.systemLang);
      const entry = Blockly.Words?.[word];
      return entry ? entry[lang || "en"] || entry.en : word;
    });
    const words = {};
    for (const [lang, texts] of Object.entries(LANGUAGES)) {
      for (const [word, text] of Object.entries(texts)) {
        if (text) {
          (words[word] || (words[word] = {}))[lang] = text;
        }
      }
    }
    Object.assign(Blockly.Words, words);
    Blockly.Words.email_help = { en: "https://github.com/ioBroker/ioBroker.email/blob/master/README.md" };
  }

  // src-blockly/blockly.ts
  var Blockly2 = window.Blockly;
  var DEFAULT_FILE_COUNT = 2;
  var MAX_FILE_COUNT = 20;
  installWords();
  Blockly2.Sendto.blocks.email = `<block type="email">
  <mutation filecount="${DEFAULT_FILE_COUNT}"></mutation>
  <field name="INSTANCE"></field>
  <field name="IS_HTML">FALSE</field>
  <field name="LOG"></field>
  <value name="TO">
    <shadow type="text">
      <field name="TEXT">user@domain.tld</field>
    </shadow>
  </value>
  <value name="TEXT">
    <shadow type="text">
      <field name="TEXT"></field>
    </shadow>
  </value>
  <value name="SUBJECT">
    <shadow type="text">
      <field name="TEXT"></field>
    </shadow>
  </value>
</block>`;
  Blockly2.Blocks.email = {
    itemCount_: DEFAULT_FILE_COUNT,
    init: function() {
      const options = [[Blockly2.Translate("email_anyInstance"), ""]];
      const instances = window.main?.instances;
      if (instances) {
        for (let i = 0; i < instances.length; i++) {
          const m = instances[i].match(/^system\.adapter\.email\.(\d+)$/);
          if (m) {
            const k = parseInt(m[1], 10);
            options.push([`email.${k}`, `.${k}`]);
          }
        }
      }
      if (options.length === 1) {
        for (let n = 0; n <= 4; n++) {
          options.push([`email.${n}`, `.${n}`]);
        }
      }
      this.appendDummyInput("INSTANCE").appendField(Blockly2.Translate("email")).appendField(new Blockly2.FieldDropdown(options), "INSTANCE");
      this.appendValueInput("TO").appendField(Blockly2.Translate("email_to"));
      this.appendDummyInput("IS_HTML").appendField(Blockly2.Translate("email_is_html")).appendField(new Blockly2.FieldCheckbox("FALSE"), "IS_HTML");
      this.appendValueInput("TEXT").setCheck("String").appendField(Blockly2.Translate("email_text"));
      for (const [name, word] of [
        ["SUBJECT", "email_subject"],
        ["FROM", "email_from"]
      ]) {
        const input = this.appendValueInput(name).setCheck("String").appendField(Blockly2.Translate(word));
        if (input.connection) {
          input.connection._optional = true;
        }
      }
      this.updateShape_();
      this.appendDummyInput("LOG").appendField(Blockly2.Translate("email_log")).appendField(
        new Blockly2.FieldDropdown([
          [Blockly2.Translate("email_log_none"), ""],
          [Blockly2.Translate("email_log_debug"), "debug"],
          [Blockly2.Translate("email_log_info"), "log"],
          [Blockly2.Translate("email_log_warn"), "warn"],
          [Blockly2.Translate("email_log_error"), "error"]
        ]),
        "LOG"
      );
      this.setInputsInline(false);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(Blockly2.Sendto.HUE);
      this.setTooltip(Blockly2.Translate("email_tooltip"));
      this.setHelpUrl(Blockly2.Translate("email_help"));
    },
    /** Stores the number of attachment rows in the workspace XML */
    mutationToDom: function() {
      const container = document.createElement("mutation");
      container.setAttribute("filecount", String(this.itemCount_));
      return container;
    },
    /**
     * Restores the number of attachment rows
     *
     * @param xmlElement the `<mutation>` element saved with the block
     */
    domToMutation: function(xmlElement) {
      const rawCount = parseInt(xmlElement.getAttribute("filecount") || "", 10);
      this.itemCount_ = isNaN(rawCount) ? DEFAULT_FILE_COUNT : Math.max(0, Math.min(rawCount, MAX_FILE_COUNT));
      this.updateShape_();
    },
    /** The + button below the attachment rows */
    addFile_: function() {
      const connections = this.saveFileConnections_();
      connections.push(null);
      this.itemCount_++;
      this.updateShape_(connections);
    },
    /**
     * The - button in front of an attachment row
     *
     * @param index 1-based row number
     */
    removeFileAt_: function(index) {
      const connections = this.saveFileConnections_();
      connections.splice(index - 1, 1);
      this.itemCount_--;
      this.updateShape_(connections);
    },
    /** Detaches whatever hangs on the attachment rows and returns it, so it survives a rebuild */
    saveFileConnections_: function() {
      const connections = [];
      for (let i = 1; i <= this.itemCount_; i++) {
        const conn = this.getInput(`FILE_${i}`)?.connection?.targetConnection;
        if (conn) {
          conn.disconnect();
        }
        connections.push(conn || null);
      }
      return connections;
    },
    /**
     * Rebuilds the attachment rows so the block matches `itemCount_`
     *
     * @param connections what hung on the rows before, from `saveFileConnections_`
     */
    updateShape_: function(connections) {
      let i = 1;
      while (this.getInput(`FILE_${i}`)) {
        this.removeInput(`FILE_${i}`);
        i++;
      }
      if (this.getInput("PLUS_ROW")) {
        this.removeInput("PLUS_ROW");
      }
      for (let j = 1; j <= this.itemCount_; j++) {
        const idx = j;
        const input = this.appendValueInput(`FILE_${j}`).setCheck("String").appendField(
          new Blockly2.FieldImage(MINUS_IMAGE, 15, 15, "-", function() {
            this.getSourceBlock().removeFileAt_(idx);
          })
        ).appendField(Blockly2.Translate("email_file"));
        if (input.connection) {
          input.connection._optional = true;
        }
        const previous = connections?.[j - 1];
        if (previous) {
          input.connection.connect(previous);
        }
        if (this.getInput("LOG")) {
          this.moveInputBefore(`FILE_${j}`, "LOG");
        }
      }
      this.appendDummyInput("PLUS_ROW").appendField(
        new Blockly2.FieldImage(PLUS_IMAGE, 15, 15, "+", function() {
          this.getSourceBlock().addFile_();
        })
      );
      if (this.getInput("LOG")) {
        this.moveInputBefore("PLUS_ROW", "LOG");
      }
    }
  };
  function emailToJavaScript(block) {
    const instance = block.getFieldValue("INSTANCE");
    const logLevel = block.getFieldValue("LOG");
    const message = Blockly2.JavaScript.valueToCode(block, "TEXT", Blockly2.JavaScript.ORDER_ATOMIC);
    const isHtml = block.getFieldValue("IS_HTML");
    const lines = ["{\n"];
    if (message) {
      lines.push(isHtml === "TRUE" ? `  html: ${message},
` : `  text: ${message},
`);
    }
    for (const [input, key] of [
      ["TO", "to"],
      ["SUBJECT", "subject"],
      ["FROM", "from"]
    ]) {
      const value = Blockly2.JavaScript.valueToCode(block, input, Blockly2.JavaScript.ORDER_ATOMIC);
      if (value) {
        lines.push(`  ${key}: ${value},
`);
      }
    }
    const fileCount = block.itemCount_ ?? DEFAULT_FILE_COUNT;
    const attachments = [];
    for (let f = 1; f <= fileCount; f++) {
      const file = Blockly2.JavaScript.valueToCode(block, `FILE_${f}`, Blockly2.JavaScript.ORDER_ATOMIC);
      if (file) {
        attachments.push(`    { path: ${file}, cid: 'file${f}' },
`);
      }
    }
    if (attachments.length) {
      lines.push("  attachments:[\n", ...attachments, "  ],\n");
    }
    lines.push("}");
    const logText = logLevel ? `console.${logLevel}('email: '${message ? ` + ${message}` : ""});
` : "";
    return `sendTo('email${instance}', 'send', ${lines.join("")});
${logText}`;
  }
  if (Blockly2.JavaScript.forBlock) {
    Blockly2.JavaScript.forBlock.email = emailToJavaScript;
  } else {
    Blockly2.JavaScript.email = emailToJavaScript;
  }
})();
