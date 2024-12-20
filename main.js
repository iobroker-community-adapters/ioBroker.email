/**
 *
 *      ioBroker email Adapter
 *
 *      (c) 2014-2019 bluefox <dogafox@gmail.com>
 *
 *      MIT License
 *
 */
'use strict';

const utils = require('@iobroker/adapter-core'); // Get common adapter utils
const adapterName = require('./package.json').name.split('.').pop();
let adapter;

function startAdapter(options) {
    options = options || {};
    Object.assign(options, {
        name: adapterName, // adapter name
    });

    adapter = new utils.Adapter(options);

    adapter.on('unload', cb => {
        if (adapter.__stopTimer) {
            clearTimeout(adapter.__stopTimer);
            adapter.__stopTimer = null;
        }
        cb && cb();
    });

    adapter.on('message', obj => {
        if (obj && obj.command === 'send') {
            processMessage(adapter, obj);
        } else if (obj.command === 'sendNotification') {
            processNotification(adapter, obj);
        }
    });

    adapter.on('ready', () => {
        // it must be like this
        adapter.config.transportOptions.auth.pass = adapter.decrypt(
            'Zgfr56gFe87jJOM',
            adapter.config.transportOptions.auth.pass,
        );
        main(adapter);
    });

    adapter.__emailTransport = null;
    adapter.__stopTimer = null;
    adapter.__lastMessageTime = 0;
    adapter.__lastMessageText = '';

    return adapter;
}

// Terminate adapter after 30 seconds idle
function stop(adapter) {
    if (adapter && adapter.__stopTimer) {
        clearTimeout(adapter.__stopTimer);
        adapter.__stopTimer = null;
    }

    // Stop only if subscribe mode
    //noinspection JSUnresolvedVariable
    if (adapter && adapter.common && adapter.common.mode === 'subscribe') {
        adapter.__stopTimer = setTimeout(() => {
            adapter.__stopTimer = null;
            adapter.stop();
        }, 30000);
    }
}

/**
 * Process a `sendNotification` request
 *
 * @param adapter
 * @param obj
 */
function processNotification(adapter, obj) {
    adapter.log.info(`New notification received from ${obj.from}`);

    const mail = buildMessageFromNotification(obj.message);
    sendEmail(adapter, null, null, mail, error => {
        obj.callback && adapter.sendTo(obj.from, 'sendNotification', { sent: !error }, obj.callback);
    });
}

/**
 * Build up a mail object from the notification message
 *
 * @param message
 * @returns
 */
function buildMessageFromNotification(message) {
    const subject = message.category.name;
    const { instances } = message.category;

    const readableInstances = Object.entries(instances).map(([instance, entry]) => {
        if (instance.startsWith('system.host.')) {
            return `${instance.substring('system.host.'.length)}: ${getNewestMessage(entry.messages)}`;
        }

        return `${instance.substring('system.adapter.'.length)}: ${getNewestMessage(entry.messages)}`;
    });

    const text = `${message.category.description}

${message.host}:   
${readableInstances.join('\n')}
    `;

    return { subject, text };
}

/**
 * Extract the newest message out of a notification messages together with the localized date
 *
 * @param messages
 * @returns string
 */
function getNewestMessage(messages) {
    const newestMessage = messages.sort((a, b) => (a.ts < b.ts ? 1 : -1))[0];

    return `${new Date(newestMessage.ts).toLocaleString()} ${newestMessage.message}`;
}

function processMessage(adapter, obj) {
    if (!obj || !obj.message) {
        return;
    }

    // filter out double messages
    const json = JSON.stringify(obj.message);
    if (
        adapter.__lastMessageTime &&
        adapter.__lastMessageText === json &&
        Date.now() - adapter.__lastMessageTime < 1000
    ) {
        return adapter.log.debug(
            `Filter out double message [first was for ${Date.now() - adapter.__lastMessageTime}ms]: ${json}`,
        );
    }

    adapter.__lastMessageTime = Date.now();
    adapter.__lastMessageText = json;

    if (adapter.__stopTimer) {
        clearTimeout(adapter.__stopTimer);
        adapter.__stopTimer = null;
    }

    if (obj.message.options) {
        let options = JSON.parse(JSON.stringify(obj.message.options));
        options.secure = options.secure === 'true';
        options.requireTLS = options.requireTLS === 'true';
        options.auth.pass = decodeURIComponent(options.auth.pass);
        delete obj.message.options;
        sendEmail(
            adapter,
            null,
            options,
            obj.message,
            error => obj.callback && adapter.sendTo(obj.from, 'send', { error }, obj.callback),
        );
    } else {
        adapter.__emailTransport = sendEmail(
            adapter,
            adapter.__emailTransport,
            adapter.config.transportOptions,
            obj.message,
            error => obj.callback && adapter.sendTo(obj.from, 'send', { error }, obj.callback),
        );
    }

    stop(adapter);
}

function main(adapter) {
    stop(adapter);
}

function sendEmail(adapter, transport, options, message, callback) {
    message = message || {};

    options = options || adapter.config.transportOptions;

    if (!transport) {
        //noinspection JSUnresolvedVariable
        if (!options.host || !options.port) {
            //noinspection JSUnresolvedVariable
            if (options.host !== undefined) {
                delete options.host;
            }
            //noinspection JSUnresolvedVariable
            if (options.port !== undefined) {
                delete options.port;
            }
            //noinspection JSUnresolvedVariable
            if (options.secure !== undefined) {
                delete options.secure;
            }
            //noinspection JSUnresolvedVariable
            if (options.requireTLS !== undefined) {
                delete options.requireTLS;
            }
        } else {
            //noinspection JSUnresolvedVariable
            if (options.service !== undefined) {
                delete options.service;
            }
            if (options.requireTLS === undefined) {
                options.requireTLS = false;
            }
            if (!options.secure && !options.requireTLS) {
                options.ignoreTLS = true;
            }
        }
        //noinspection JSUnresolvedVariable
        if (options.service === 'web.de') {
            //noinspection JSUnresolvedVariable
            options.domains = ['web.de'];
            //noinspection JSUnresolvedVariable
            options.host = 'smtp.web.de';
            //noinspection JSUnresolvedVariable
            options.port = '587';
            //noinspection JSUnresolvedVariable
            //options.tls = {ciphers: 'SSLv3', rejectUnauthorized: false };
            //noinspection JSUnresolvedVariable
            options.requireTLS = true;
            //noinspection JSUnresolvedVariable
            delete options.service;
        } else if (options.service === '1und1' || options.service === 'ionos') {
            //noinspection JSUnresolvedVariable
            options.host = 'smtp.ionos.de';
            //noinspection JSUnresolvedVariable
            options.port = '587';
            //noinspection JSUnresolvedVariable
            //options.tls = {ciphers: 'SSLv3', rejectUnauthorized: false };
            //noinspection JSUnresolvedVariable
            options.requireTLS = true;
            //noinspection JSUnresolvedVariable
            delete options.service;
        } else if (options.service === 'Office365') {
            //noinspection JSUnresolvedVariable
            //options.secureConnection = false;
            //noinspection JSUnresolvedVariable
            //options.tls = {ciphers: 'SSLv3'};
            //noinspection JSUnresolvedVariable
            options.requireTLS = true;
            //noinspection JSUnresolvedVariable
            options.host = 'smtp.office365.com';
            //noinspection JSUnresolvedVariable
            options.port = '587';
            //noinspection JSUnresolvedVariable
            delete options.service;
        } else if (options.service === 'ith') {
            //noinspection JSUnresolvedVariable
            //options.secureConnection = false;
            //noinspection JSUnresolvedVariable
            options.tls = { ciphers: 'SSLv3', rejectUnauthorized: false };
            //noinspection JSUnresolvedVariable
            options.requireTLS = true;
            //noinspection JSUnresolvedVariable
            options.host = 'mail.ithnet.com';
            //noinspection JSUnresolvedVariable
            options.port = '587';
            //noinspection JSUnresolvedVariable
            delete options.service;
        } else if (options.service === 'mail.ee') {
            //noinspection JSUnresolvedVariable
            //options.secureConnection = false;
            //noinspection JSUnresolvedVariable
            options.tls = { ciphers: 'SSLv3', rejectUnauthorized: false };
            //noinspection JSUnresolvedVariable
            options.requireTLS = true;
            //noinspection JSUnresolvedVariable
            options.host = 'mail.ee';
            //noinspection JSUnresolvedVariable
            options.port = '587';
            //noinspection JSUnresolvedVariable
            delete options.service;
        }
        //noinspection JSUnresolvedFunction, JSUnresolvedVariable
        transport = require('nodemailer').createTransport(options);
    }

    if (typeof message !== 'object') {
        message = { text: message };
    }

    //noinspection JSUnresolvedVariable
    message.from = message.from || adapter.config.defaults.from;
    //noinspection JSUnresolvedVariable
    message.to = message.to || adapter.config.defaults.to;
    //noinspection JSUnresolvedVariable
    message.subject = message.subject || adapter.config.defaults.subject;
    //noinspection JSUnresolvedVariable
    message.text = message.text || adapter.config.defaults.text;

    adapter.log.info(`Send email: ${JSON.stringify(message)}`);

    //noinspection JSUnresolvedFunction
    transport.sendMail(message, (error, info) => {
        if (error) {
            // adapter.log.error(`Error ${error.response}` || error.message || error.code || JSON.stringify(error));
            adapter.log.error(`Error ${error.response || error.message || error.code || JSON.stringify(error)}`);
            typeof callback === 'function' &&
                callback(error.response || error.message || error.code || JSON.stringify(error));
        } else {
            //noinspection JSUnresolvedVariable
            adapter.log.info(`sent to ${message.to}`);
            adapter.log.debug(`Response: ${info.response}`);
            typeof callback === 'function' && callback(null);
        }
        stop();
    });

    return transport;
}

// If started as allInOne mode => return function to create instance
if (module && module.parent) {
    module.exports = startAdapter;
} else {
    // or start the instance directly
    startAdapter();
}
