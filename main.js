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
const tools = require(utils.controllerDir + '/lib/tools.js');
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

    adapter.on('message', obj =>
        obj && obj.command === 'send' && processMessage(adapter, obj));

    adapter.on('ready', () => {
        // it must be like this
        adapter.config.transportOptions.auth.pass = tools.decrypt('Zgfr56gFe87jJOM', adapter.config.transportOptions.auth.pass);
        main(adapter);
    });

    adapter.__emailTransport  = null;
    adapter.__stopTimer       = null;
    adapter.__lastMessageTime = 0;
    adapter.__lastMessageText = '';

    return adapter;
}

// Terminate adapter after 30 seconds idle
function stop(adapter) {
    if (adapter.__stopTimer) {
        clearTimeout(adapter.__stopTimer);
        adapter.__stopTimer = null;
    }

    // Stop only if subscribe mode
    //noinspection JSUnresolvedVariable
    if (adapter.common && adapter.common.mode === 'subscribe') {
        adapter.__stopTimer = setTimeout(() => {
            adapter.__stopTimer = null;
            adapter.stop();
        }, 30000);
    }
}

function processMessage(adapter, obj) {
    if (!obj || !obj.message) {
        return;
    }

    // filter out double messages
    const json = JSON.stringify(obj.message);
    if (adapter.__lastMessageTime && adapter.__lastMessageText === json && Date.now() - adapter.__lastMessageTime < 1000) {
        return adapter.log.debug('Filter out double message [first was for ' + (Date.now() - adapter.__lastMessageTime) + 'ms]: ' + json);
    }

    adapter.__lastMessageTime = Date.now();
    adapter.__lastMessageText = json;

    if (adapter.__stopTimer) {
        clearTimeout(adapter.__stopTimer);
        adapter.__stopTimer = null;
    }

    if (obj.message.options) {
        const  options = JSON.parse(JSON.stringify(obj.message.options));
        delete obj.message.options;
        sendEmail(adapter, null, options, obj.message, error =>
            obj.callback && adapter.sendTo(obj.from, 'send', {error}, obj.callback));
    } else {
        adapter.__emailTransport = sendEmail(adapter, adapter.__emailTransport, adapter.config.transportOptions, obj.message);
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

    if (typeof message !== 'object') {
        message = {text: message};
    }

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
    transport.sendMail(message, (error, info) => {
        if (error) {
            adapter.log.error('Error ' + error.response || error.message || error.code || JSON.stringify(error));
            typeof callback === 'function' && callback(error.response || error.message || error.code || JSON.stringify(error));
        } else {
            //noinspection JSUnresolvedVariable
            adapter.log.info('sent to ' + message.to);
            adapter.log.debug('Response: ' + info.response);
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