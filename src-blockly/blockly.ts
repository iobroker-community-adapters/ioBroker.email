/**
 * The ioBroker.email block for the Blockly editor of ioBroker.javascript.
 *
 * This is the source of `admin/blockly.js`, which is a generated bundle - do not edit that file,
 * run `npm run build:blockly` instead.
 *
 * The editor loads the bundle as a classic script *after* Blockly itself is up, so the runtime is
 * taken from `window.Blockly` and the `blockly` package contributes types only. See
 * `src-blockly/README.md` for why importing the runtime would break the block.
 */
import type { Block, Connection, FieldImage } from 'blockly/core';

import { MINUS_IMAGE, PLUS_IMAGE } from './icons';
import { installWords } from './words';

const Blockly = window.Blockly;

/** How many attachment rows a block gets that was saved before the rows were configurable */
const DEFAULT_FILE_COUNT = 2;
/** Upper bound for the row count restored from a mutation */
const MAX_FILE_COUNT = 20;

/** The block plus the state its mutation keeps */
interface EmailBlock extends Block {
    /** number of attachment rows */
    itemCount_: number;
    updateShape_: (connections?: (Connection | null)[]) => void;
    addFile_: () => void;
    removeFileAt_: (index: number) => void;
    saveFileConnections_: () => (Connection | null)[];
}

installWords();

Blockly.Sendto.blocks.email = `<block type="email">
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

Blockly.Blocks.email = {
    itemCount_: DEFAULT_FILE_COUNT,

    init: function (this: EmailBlock): void {
        const options: [string, string][] = [[Blockly.Translate('email_anyInstance'), '']];
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

        // Nothing but "all instances" so far - the editor does not know any email instance (yet),
        // so offer the usual ones. The original guarded this with `options.length === 0`, which can
        // never be true because "all instances" is already in.
        if (options.length === 1) {
            for (let n = 0; n <= 4; n++) {
                options.push([`email.${n}`, `.${n}`]);
            }
        }

        this.appendDummyInput('INSTANCE')
            .appendField(Blockly.Translate('email'))
            .appendField(new Blockly.FieldDropdown(options), 'INSTANCE');

        this.appendValueInput('TO').appendField(Blockly.Translate('email_to'));

        this.appendDummyInput('IS_HTML')
            .appendField(Blockly.Translate('email_is_html'))
            .appendField(new Blockly.FieldCheckbox('FALSE'), 'IS_HTML');

        this.appendValueInput('TEXT').setCheck('String').appendField(Blockly.Translate('email_text'));

        for (const [name, word] of [
            ['SUBJECT', 'email_subject'],
            ['FROM', 'email_from'],
        ] as const) {
            const input = this.appendValueInput(name).setCheck('String').appendField(Blockly.Translate(word));
            if (input.connection) {
                // Blockly has no public API for an optional input
                (input.connection as unknown as { _optional: boolean })._optional = true;
            }
        }

        // adds the attachment rows and the + button below them
        this.updateShape_();

        this.appendDummyInput('LOG')
            .appendField(Blockly.Translate('email_log'))
            .appendField(
                new Blockly.FieldDropdown([
                    [Blockly.Translate('email_log_none'), ''],
                    [Blockly.Translate('email_log_debug'), 'debug'],
                    [Blockly.Translate('email_log_info'), 'log'],
                    [Blockly.Translate('email_log_warn'), 'warn'],
                    [Blockly.Translate('email_log_error'), 'error'],
                ]),
                'LOG',
            );

        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);

        this.setColour(Blockly.Sendto.HUE);
        this.setTooltip(Blockly.Translate('email_tooltip'));
        this.setHelpUrl(Blockly.Translate('email_help'));
    },

    /** Stores the number of attachment rows in the workspace XML */
    mutationToDom: function (this: EmailBlock): Element {
        const container = document.createElement('mutation');
        container.setAttribute('filecount', String(this.itemCount_));
        return container;
    },

    /**
     * Restores the number of attachment rows
     *
     * @param xmlElement the `<mutation>` element saved with the block
     */
    domToMutation: function (this: EmailBlock, xmlElement: Element): void {
        const rawCount = parseInt(xmlElement.getAttribute('filecount') || '', 10);
        // blocks saved before the rows were configurable carry no count at all
        this.itemCount_ = isNaN(rawCount) ? DEFAULT_FILE_COUNT : Math.max(0, Math.min(rawCount, MAX_FILE_COUNT));
        this.updateShape_();
    },

    /** The + button below the attachment rows */
    addFile_: function (this: EmailBlock): void {
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
    removeFileAt_: function (this: EmailBlock, index: number): void {
        const connections = this.saveFileConnections_();
        connections.splice(index - 1, 1);
        this.itemCount_--;
        this.updateShape_(connections);
    },

    /** Detaches whatever hangs on the attachment rows and returns it, so it survives a rebuild */
    saveFileConnections_: function (this: EmailBlock): (Connection | null)[] {
        const connections: (Connection | null)[] = [];
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
    updateShape_: function (this: EmailBlock, connections?: (Connection | null)[]): void {
        // Remove existing FILE inputs and + row
        let i = 1;
        while (this.getInput(`FILE_${i}`)) {
            this.removeInput(`FILE_${i}`);
            i++;
        }
        if (this.getInput('PLUS_ROW')) {
            this.removeInput('PLUS_ROW');
        }

        // Re-add FILE inputs with individual minus buttons
        for (let j = 1; j <= this.itemCount_; j++) {
            const idx = j;
            const input = this.appendValueInput(`FILE_${j}`)
                .setCheck('String')
                .appendField(
                    new Blockly.FieldImage(MINUS_IMAGE, 15, 15, '-', function (this: FieldImage): void {
                        (this.getSourceBlock() as EmailBlock).removeFileAt_(idx);
                    }),
                )
                .appendField(Blockly.Translate('email_file'));
            if (input.connection) {
                (input.connection as unknown as { _optional: boolean })._optional = true;
            }
            const previous = connections?.[j - 1];
            if (previous) {
                input.connection!.connect(previous);
            }
            // during init() the log row does not exist yet, the file rows are appended in place
            if (this.getInput('LOG')) {
                this.moveInputBefore(`FILE_${j}`, 'LOG');
            }
        }

        // Add + row at the bottom of the file section
        this.appendDummyInput('PLUS_ROW').appendField(
            new Blockly.FieldImage(PLUS_IMAGE, 15, 15, '+', function (this: FieldImage): void {
                (this.getSourceBlock() as EmailBlock).addFile_();
            }),
        );
        if (this.getInput('LOG')) {
            this.moveInputBefore('PLUS_ROW', 'LOG');
        }
    },
};

function emailToJavaScript(block: Block): string {
    const instance = block.getFieldValue('INSTANCE');
    const logLevel = block.getFieldValue('LOG');
    const message = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_ATOMIC);
    const isHtml = block.getFieldValue('IS_HTML');

    const lines = ['{\n'];
    // an unconnected text input yields no code at all - `text: ,` would not parse
    if (message) {
        lines.push(isHtml === 'TRUE' ? `  html: ${message},\n` : `  text: ${message},\n`);
    }

    for (const [input, key] of [
        ['TO', 'to'],
        ['SUBJECT', 'subject'],
        ['FROM', 'from'],
    ] as const) {
        const value = Blockly.JavaScript.valueToCode(block, input, Blockly.JavaScript.ORDER_ATOMIC);
        if (value) {
            lines.push(`  ${key}: ${value},\n`);
        }
    }

    // The cid keeps the row number, so an empty row in between does not renumber the ones after it
    const fileCount = (block as EmailBlock).itemCount_ ?? DEFAULT_FILE_COUNT;
    const attachments: string[] = [];
    for (let f = 1; f <= fileCount; f++) {
        const file = Blockly.JavaScript.valueToCode(block, `FILE_${f}`, Blockly.JavaScript.ORDER_ATOMIC);
        if (file) {
            attachments.push(`    { path: ${file}, cid: 'file${f}' },\n`);
        }
    }
    if (attachments.length) {
        lines.push('  attachments:[\n', ...attachments, '  ],\n');
    }

    lines.push('}');

    const logText = logLevel ? `console.${logLevel}('email: '${message ? ` + ${message}` : ''});\n` : '';

    return `sendTo('email${instance}', 'send', ${lines.join('')});\n${logText}`;
}

// Blockly >= 10 looks the generator up in `forBlock`. Registering on the plain slot is not enough:
// the editor migrates that slot to `forBlock` for its own blocks only, because its migration step
// has already run by the time an adapter's blockly.js is loaded.
if (Blockly.JavaScript.forBlock) {
    Blockly.JavaScript.forBlock.email = emailToJavaScript;
} else {
    Blockly.JavaScript.email = emailToJavaScript;
}
