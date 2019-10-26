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
//noinspection JSUnresolvedFunction
const adapter = utils.Adapter('email');

adapter.on('message', obj => {
    //noinspection JSUnresolvedconst iable
    obj && obj.command === 'send' && processMessage(obj);
    processMessages();
});

adapter.on('ready', () => {
    // it must be like this
    /*
    adapter.getForeignObject('system.config', function (err, obj) {
        if (obj && obj.native && obj.native.secret) {
            //noinspection JSUnresolvedconst iable
            adapter.config.transportOptions.auth.pass = decrypt(obj.native.secret, adapter.config.transportOptions.auth.pass);
        } else {
            //noinspection JSUnresolvedconst iable
            adapter.config.transportOptions.auth.pass = decrypt('Zgfr56gFe87jJOM', adapter.config.transportOptions.auth.pass);
        }
        main();
    });
    */

    //noinspection JSUnresolvedconst iable
    adapter.config.transportOptions.auth.pass = decrypt('Zgfr56gFe87jJOM', adapter.config.transportOptions.auth.pass);
    main();
});

let  emailTransport;
let  stopTimer       =  null;
let  lastMessageTime = 0;
let  lastMessageText = '';

function decrypt(key, value) {
    let result = '';
    for (let  i = 0; i < value.length; ++i) {
        result += String.fromCharCode(key[i % key.length].charCodeAt(0) ^ value.charCodeAt(i));
    }
    return result;
}

// Terminate adapter after 30 seconds idle
function stop() {
    if (stopTimer) {
        clearTimeout(stopTimer);
        stopTimer = null;
    }

    // Stop only if subscribe mode
    //noinspection JSUnresolvedconst iable
    if (adapter.common && adapter.common.mode === 'subscribe') {
        stopTimer = setTimeout(function () {
            stopTimer = null;
            adapter.stop();
        }, 30000);
    }
}

function processMessage(obj) {
    if (!obj || !obj.message) return;

    // filter out double messages
    const  json = JSON.stringify(obj.message);
    if (lastMessageTime && lastMessageText === JSON.stringify(obj.message) && new Date().getTime() - lastMessageTime < 1000) {
        adapter.log.debug('Filter out double message [first was for ' + (new Date().getTime() - lastMessageTime) + 'ms]: ' + json);
        return;
    }
    lastMessageTime = new Date().getTime();
    lastMessageText = json;

    if (stopTimer) {
        clearTimeout(stopTimer);
        stopTimer = null;
    }

    if (obj.message.options) {
        const  options = JSON.parse(JSON.stringify(obj.message.options));
        delete obj.message.options;
        sendEmail(null, options, obj.message, function (error) {
            if (obj.callback) adapter.sendTo(obj.from, 'send', {error: error}, obj.callback);
        });
    } else {
        emailTransport = sendEmail(emailTransport, adapter.config.transportOptions, obj.message);
    }

    stop();
}

function processMessages() {
    //noinspection JSUnresolvedFunction
    if (typeof adapter.getMessage !== 'function') {
        return;
    }

    adapter.getMessage((err, obj) => {
        if (obj) {
            processMessage(obj);
            processMessages();
        }
    });
}

function main() {
    // Adapter is started only if some one writes into "system.adapter.email.X.messagebox" new value
    processMessages();
    stop();
}

function sendEmail(transport, options, message, callback) {
    message = message || {};

    options = options || adapter.config.transportOptions;

    if (!transport) {
        //noinspection JSUnresolvedconst iable
        if (!options.host || !options.port) {
            //noinspection JSUnresolvedconst iable
            if (options.host    !== undefined) delete options.host;
            //noinspection JSUnresolvedconst iable
            if (options.port    !== undefined) delete options.port;
            //noinspection JSUnresolvedconst iable
            if (options.secure  !== undefined) delete options.secure;
        } else {
            //noinspection JSUnresolvedconst iable
            if (options.service !== undefined) delete options.service;
        }
        //noinspection JSUnresolvedconst iable
        if (options.service === 'web.de') {
            //noinspection JSUnresolvedconst iable
            options.domains = ['web.de'];
            //noinspection JSUnresolvedconst iable
            options.host = 'smtp.web.de';
            //noinspection JSUnresolvedconst iable
            options.port = '587';
            //options.tls = {ciphers: 'SSLv3'};
            //noinspection JSUnresolvedconst iable
            delete options.service;
        } else if (options.service === 'Office365') {
            //noinspection JSUnresolvedconst iable
            options.secureConnection = false;
            //noinspection JSUnresolvedconst iable
            options.tls = {ciphers: 'SSLv3'};
            //noinspection JSUnresolvedconst iable
            options.domains = ['web.de'];
            //noinspection JSUnresolvedconst iable
            options.host = 'smtp.office365.com';
            //noinspection JSUnresolvedconst iable
            options.port = '587';
            //noinspection JSUnresolvedconst iable
            delete options.service;
        } else if (options.service === 'ith') {
            //noinspection JSUnresolvedconst iable
            options.secureConnection = false;
            //noinspection JSUnresolvedconst iable
            options.tls = {ciphers: 'SSLv3', rejectUnauthorized: false };
            //noinspection JSUnresolvedconst iable
            options.requireTLS = true;
            //noinspection JSUnresolvedconst iable
            options.host = 'mail.ithnet.com';
            //noinspection JSUnresolvedconst iable
            options.port = '587';
            //noinspection JSUnresolvedconst iable
            delete options.service;
        }
        //noinspection JSUnresolvedFunction, JSUnresolvedconst iable
        transport = require('nodemailer').createTransport(options);
    }

    if (typeof message !== 'object') message = {text: message};

    //noinspection JSUnresolvedconst iable
    message.from =    message.from    || adapter.config.defaults.from;
    //noinspection JSUnresolvedconst iable
    message.to =      message.to      || adapter.config.defaults.to;
    //noinspection JSUnresolvedconst iable
    message.subject = message.subject || adapter.config.defaults.subject;
    //noinspection JSUnresolvedconst iable
    message.text =    message.text    || adapter.config.defaults.text;

    adapter.log.info('Send email: ' + JSON.stringify(message));

    //noinspection JSUnresolvedFunction
    transport.sendMail(message, (error, info) => {
        if (error) {
            adapter.log.error('Error ' + error.response || error.message || error.code || JSON.stringify(error));
            typeof callback !== 'function' && callback(error.response || error.message || error.code || JSON.stringify(error));
        } else {
            //noinspection JSUnresolvedconst iable
            adapter.log.info('sent to ' + message.to);
            adapter.log.debug('Response: ' + info.response);
            typeof callback !== 'function' && callback(null);
        }
        stop();
    });

    return transport;
}
