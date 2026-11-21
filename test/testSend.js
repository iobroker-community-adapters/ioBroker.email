const assert = require('node:assert');
const { EventEmitter } = require('node:events');
const path = require('node:path');

const buildDir = path.join(__dirname, '../build');
const mainPath = require.resolve('../build/main');

/** Puts a fake module into the require cache as the build would resolve it */
function fakeModule(name, exports) {
    const filename = require.resolve(name, { paths: [buildDir] });
    require.cache[filename] = { id: filename, filename, loaded: true, exports };
    return filename;
}

/**
 * The adapter with a fake adapter core and a fake nodemailer: `mails` gets every sent mail, `answers` every answer
 * as it arrives over sendTo. The mail server accepts every address of `to`, or fails with `error`.
 */
function createAdapter(error) {
    const mails = [];
    const answers = [];
    class FakeAdapter extends EventEmitter {
        constructor(options) {
            super();
            this.options = options;
            this.config = {
                transportOptions: { service: 'Gmail', auth: { user: 'me@example.com', pass: 'x' } },
                defaults: { from: 'me@example.com', to: 'Me <me@example.com>, other@example.com', subject: 'ioBroker' },
            };
            this.log = { debug() {}, info() {}, warn() {}, error() {} };
        }
        sendTo(from, command, message) {
            answers.push({ command, message: JSON.parse(JSON.stringify(message)) });
        }
        async readFileAsync(id, file) {
            if (id === 'echarts.0' && file === 'charts/day.png') {
                return { file: Buffer.from('PNG'), mimeType: 'image/png' };
            }
            throw new Error('Not exists');
        }
    }
    const nodemailer = {
        createTransport: () => ({
            sendMail(mail, callback) {
                mails.push(mail);
                if (error) {
                    callback(new Error(error));
                } else {
                    callback(null, { response: '250 OK', accepted: String(mail.to).split(',') });
                }
            },
            close() {},
        }),
    };
    const fakes = [
        fakeModule('@iobroker/adapter-core', { Adapter: FakeAdapter }),
        fakeModule('nodemailer', nodemailer),
    ];
    delete require.cache[mainPath];
    try {
        const adapter = require(mainPath)();
        let id = 0;
        const send = (command, message) =>
            new Promise(resolve => {
                adapter.options.message({
                    command,
                    from: 'system.adapter.javascript.0',
                    callback: { id: ++id },
                    message,
                });
                setTimeout(resolve, 20);
            });
        return { adapter, mails, answers, send };
    } finally {
        for (const filename of [...fakes, mainPath]) {
            delete require.cache[filename];
        }
    }
}

describe('send', () => {
    it('keeps result and adds ok and sent', async () => {
        const { answers, mails, send } = createAdapter();
        await send('send', { to: 'a@example.com, b@example.com', subject: 'Hi', text: 'test' });
        assert.deepStrictEqual(answers, [{ command: 'send', message: { result: '250 OK', ok: true, sent: 2 } }]);
        assert.strictEqual(mails[0].subject, 'Hi');
    });

    it('takes recipient, title and file of the shared catalog', async () => {
        const { answers, mails, send } = createAdapter();
        await send('send', {
            text: 'the chart',
            recipient: 'anna@example.com',
            title: 'Chart',
            file: 'iobfile://echarts.0/charts/day.png',
            files: ['data:image/png;base64,UE5H', { data: 'SlBH', contentType: 'image/jpeg', fileName: 'door.jpg' }],
        });
        assert.deepStrictEqual(answers[0].message, { result: '250 OK', ok: true, sent: 1 });
        const mail = mails[0];
        assert.strictEqual(mail.to, 'anna@example.com');
        assert.strictEqual(mail.subject, 'Chart');
        for (const key of ['recipient', 'title', 'file', 'files']) {
            assert.ok(!(key in mail), key);
        }
        assert.deepStrictEqual(
            mail.attachments.map(a => ({
                ...a,
                content: Buffer.isBuffer(a.content) ? a.content.toString() : a.content,
            })),
            [
                { filename: 'day.png', content: 'PNG' },
                { filename: 'file.png', content: 'UE5H', encoding: 'base64', contentType: 'image/png' },
                { filename: 'door.jpg', content: 'SlBH', encoding: 'base64', contentType: 'image/jpeg' },
            ],
        );
    });

    it('lets to and subject win over recipient and title', async () => {
        const { mails, send } = createAdapter();
        await send('send', { to: 'b@example.com', recipient: 'a@example.com', subject: 'S', title: 'T' });
        assert.strictEqual(mails[0].to, 'b@example.com');
        assert.strictEqual(mails[0].subject, 'S');
    });

    it('answers an error of the mail server and a missing file', async () => {
        const { answers, send } = createAdapter('Invalid login');
        await send('send', { text: 'x' });
        await send('send', { text: 'y', file: 'iobfile://echarts.0/missing.png' });
        assert.deepStrictEqual(
            answers.map(a => a.message),
            [{ error: 'Error: Invalid login' }, { error: 'Error: Not exists' }],
        );
    });

    it('answers a double and an empty message', async () => {
        const { answers, mails, send } = createAdapter();
        await send('send', { text: 'twice' });
        await send('send', { text: 'twice' });
        await send('send', '');
        assert.strictEqual(mails.length, 1);
        assert.deepStrictEqual(
            answers.map(a => a.message.reason),
            [undefined, 'DUPLICATE', 'BAD_REQUEST'],
        );
    });
});

describe('getRecipients', () => {
    it('lists the recipients of the settings', async () => {
        const { answers, mails, send } = createAdapter();
        await send('getRecipients', {});
        assert.strictEqual(mails.length, 0);
        assert.deepStrictEqual(answers[0].message, {
            recipients: [
                { id: 'me@example.com', name: 'Me', kind: 'user', default: true },
                { id: 'other@example.com', name: 'other@example.com', kind: 'user', default: true },
            ],
        });
    });

    it('answers an unknown command', async () => {
        const { answers, send } = createAdapter();
        await send('foo', {});
        assert.deepStrictEqual(answers[0].message, { error: 'Unknown command "foo"', reason: 'NOT_SUPPORTED' });
    });
});
