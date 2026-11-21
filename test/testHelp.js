const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { COMMANDS, HELP } = require('../build/lib/help');

/** The commands of `onMessage` in src/main.ts */
function commandsOfMain() {
    const source = fs.readFileSync(path.join(__dirname, '../src/main.ts'), 'utf8');
    const start = source.indexOf('onMessage(obj: ioBroker.Message)');
    const end = source.indexOf('async main()');
    assert.ok(start > 0 && end > start, 'onMessage found');
    return [...source.slice(start, end).matchAll(/obj\?\.command === '([^']+)'/g)].map(m => m[1]);
}

describe('help', () => {
    it('lists exactly the commands onMessage answers', () => {
        assert.deepStrictEqual(COMMANDS.map(c => c.command).sort(), commandsOfMain().sort());
    });

    it('marks the commands that only read', () => {
        for (const { command, write } of COMMANDS) {
            assert.strictEqual(write, !['help', 'getRecipients', 'authMicrosoft'].includes(command), command);
        }
    });

    it('marks the commands of the shared catalog', () => {
        const marked = Object.fromEntries(COMMANDS.filter(c => c.standard).map(c => [c.command, c.standard]));
        assert.deepStrictEqual(marked, { send: 'message.send', getRecipients: 'message.getRecipients' });
        for (const standard of Object.values(marked)) {
            assert.ok(HELP.includes(standard), standard);
        }
    });

    it('names every command for an agent', () => {
        for (const word of [...COMMANDS.map(c => c.command), 'sendTo email.0', "user's explicit request"]) {
            assert.ok(HELP.includes(word), word);
        }
    });

    it('keeps the lines short', () => {
        for (const line of HELP.split('\n')) {
            assert.ok(line.length <= 120, line);
        }
    });
});
