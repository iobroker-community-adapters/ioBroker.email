/**
 *
 *      ioBroker email Adapter
 *
 *      (c) 2014-2018 bluefox <dogafox@gmail.com>
 *
 *      MIT License
 *
 */
'use strict';

var utils = require('@iobroker/adapter-core'); // Get common adapter utils
//noinspection JSUnresolvedFunction
var adapter = utils.Adapter('email');

adapter.on('message', function (obj) {
    //noinspection JSUnresolvedVariable
    if (obj && obj.command === 'send') processMessage(obj);
    processMessages();
});

adapter.on('ready', function () {
    // it must be like this
    /*
    adapter.getForeignObject('system.config', function (err, obj) {
        if (obj && obj.native && obj.native.secret) {
            //noinspection JSUnresolvedVariable
            adapter.config.transportOptions.auth.pass = decrypt(obj.native.secret, adapter.config.transportOptions.auth.pass);
        } else {
            //noinspection JSUnresolvedVariable
            adapter.config.transportOptions.auth.pass = decrypt('Zgfr56gFe87jJOM', adapter.config.transportOptions.auth.pass);
        }
        main();
    });
    */

    //noinspection JSUnresolvedVariable
    adapter.config.transportOptions.auth.pass = decrypt('Zgfr56gFe87jJOM', adapter.config.transportOptions.auth.pass);
    main();
});

var emailTransport;
var stopTimer       =  null;
var lastMessageTime = 0;
var lastMessageText = '';
function decrypt(key, value) {
    var result = '';
    for (var i = 0; i < value.length; ++i) {
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
    //noinspection JSUnresolvedVariable
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
    var json = JSON.stringify(obj.message);
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
        var options = JSON.parse(JSON.stringify(obj.message.options));
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
    adapter.getMessage(function (err, obj) {
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
    if (!message) message = {};

    options = options || adapter.config.transportOptions;

    if (!transport) {
        //noinspection JSUnresolvedVariable
        if (!options.host || !options.port) {
            //noinspection JSUnresolvedVariable
            if (options.host    !== undefined) delete options.host;
            //noinspection JSUnresolvedVariable
            if (options.port    !== undefined) delete options.port;
            //noinspection JSUnresolvedVariable
            if (options.secure  !== undefined) delete options.secure;
        } else {
            //noinspection JSUnresolvedVariable
            if (options.service !== undefined) delete options.service;
        }
        //noinspection JSUnresolvedVariable
        if (options.service === 'web.de') {
            //noinspection JSUnresolvedVariable
            options.domains = ['web.de'];
            //noinspection JSUnresolvedVariable
            options.host = 'smtp.web.de';
            //noinspection JSUnresolvedVariable
            options.port = '587';
            //options.tls = {ciphers: 'SSLv3'};
            //noinspection JSUnresolvedVariable
            delete options.service;
        } else if (options.service === 'Office365') {
            //noinspection JSUnresolvedVariable
            options.secureConnection = false;
            //noinspection JSUnresolvedVariable
            options.tls = {ciphers: 'SSLv3'};
            //noinspection JSUnresolvedVariable
            options.domains = ['web.de'];
            //noinspection JSUnresolvedVariable
            options.host = 'smtp.office365.com';
            //noinspection JSUnresolvedVariable
            options.port = '587';
            //noinspection JSUnresolvedVariable
            delete options.service;
        } else if (options.service === 'ith') {
            //noinspection JSUnresolvedVariable
            options.secureConnection = false;
            //noinspection JSUnresolvedVariable
            options.tls = {ciphers: 'SSLv3', rejectUnauthorized: false };
            //noinspection JSUnresolvedVariable
            options.requireTLS = true;
            //noinspection JSUnresolvedVariable
            options.host = 'mail.ithnet.com';
            //noinspection JSUnresolvedVariable
            options.port = '587';
            //noinspection JSUnresolvedVariable
            delete options.service;
        }
        //noinspection JSUnresolvedFunction, JSUnresolvedVariable
        transport = require('nodemailer').createTransport(options);
    }

    if (typeof message !== 'object') message = {text: message};

    //noinspection JSUnresolvedVariable
    message.from =    message.from    || adapter.config.defaults.from;
    //noinspection JSUnresolvedVariable
    message.to =      message.to      || adapter.config.defaults.to;
    //noinspection JSUnresolvedVariable
    message.subject = message.subject || adapter.config.defaults.subject;
    //noinspection JSUnresolvedVariable
    message.text =    message.text    || adapter.config.defaults.text;

    adapter.log.info('Send email: ' + JSON.stringify(message));

    //noinspection JSUnresolvedFunction
    transport.sendMail(message, function (error, info) {
        if (error) {
            adapter.log.error('Error ' + JSON.stringify(error));
            if (callback) callback(error.response || error.message || error.code || JSON.stringify(error));
        } else {
            //noinspection JSUnresolvedVariable
            adapter.log.info('sent to ' + message.to);
            adapter.log.debug('Response: ' + info.response);
            if (callback) callback(null);
        }
        stop();
    });
    return transport;
}
