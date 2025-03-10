"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailAdapter = void 0;
/**
 *
 *      ioBroker email Adapter
 *
 *      (c) 2014-2025 bluefox <dogafox@gmail.com>
 *
 *      MIT License
 *
 */
const adapter_core_1 = require("@iobroker/adapter-core");
const nodemailer_1 = require("nodemailer");
class EmailAdapter extends adapter_core_1.Adapter {
    emailTransport = null;
    lastMessageTime = 0;
    lastMessageText = '';
    systemLang = 'en';
    constructor(options = {}) {
        super({
            ...options,
            name: 'email',
            ready: () => this.main(),
            message: (obj) => this.onMessage(obj),
        });
    }
    onMessage(obj) {
        if (obj?.command === 'send') {
            this.processMessage(obj);
        }
        else if (obj?.command === 'sendNotification') {
            this.processNotification(obj);
        }
    }
    async main() {
        const systemConfig = await this.getForeignObjectAsync('system.config');
        this.systemLang = systemConfig?.common?.language || 'en';
        // it must be like this
        this.config.transportOptions.auth.pass = this.decrypt('Zgfr56gFe87jJOM', this.config.transportOptions.auth.pass);
    }
    /** Process a `sendNotification` request */
    processNotification(obj) {
        this.log.info(`New notification received from ${obj.from}`);
        const mail = this.buildMessageFromNotification(obj.message);
        this.sendEmail(null, null, mail, error => {
            obj.callback && this.sendTo(obj.from, 'sendNotification', { sent: !error }, obj.callback);
        });
    }
    /** Build up a mail object from the notification message */
    buildMessageFromNotification(message) {
        let subject;
        if (typeof message.category.name === 'object') {
            subject = message.category.name[this.systemLang] || message.category.name.en;
        }
        else {
            subject = message.category.name;
        }
        const { instances } = message.category;
        const readableInstances = Object.entries(instances).map(([instance, entry]) => {
            if (instance.startsWith('system.host.')) {
                return `${instance.substring('system.host.'.length)}: ${this.getNewestMessage(entry.messages)}`;
            }
            return `${instance.substring('system.adapter.'.length)}: ${this.getNewestMessage(entry.messages)}`;
        });
        let description;
        if (typeof message.category.description === 'object') {
            description = message.category.description[this.systemLang] || message.category.description.en;
        }
        else {
            description = message.category.description;
        }
        const text = `${description}

${message.host}:   
${readableInstances.join('\n')}
    `;
        return { subject, text };
    }
    /** Extract the newest message out of a notification messages together with the localized date */
    getNewestMessage(messages) {
        const newestMessage = messages.sort((a, b) => (a.ts < b.ts ? 1 : -1))[0];
        return `${new Date(newestMessage.ts).toLocaleString()} ${newestMessage.message}`;
    }
    processMessage(obj) {
        if (!obj?.message) {
            return;
        }
        // filter out a double message
        const json = JSON.stringify(obj.message);
        if (this.lastMessageTime && this.lastMessageText === json && Date.now() - this.lastMessageTime < 1000) {
            return this.log.debug(`Filter out double message [first was for ${Date.now() - this.lastMessageTime}ms]: ${json}`);
        }
        this.lastMessageTime = Date.now();
        this.lastMessageText = json;
        if (obj.message.options) {
            const options = JSON.parse(JSON.stringify(obj.message.options));
            options.secure = options.secure === 'true' || options.secure === true;
            options.requireTLS = options.requireTLS === 'true' || options.requireTLS === true;
            options.auth.pass = decodeURIComponent(options.auth.pass);
            delete obj.message.options;
            this.sendEmail(null, options, obj.message, error => obj.callback && this.sendTo(obj.from, 'send', { error }, obj.callback));
        }
        else {
            this.emailTransport = this.sendEmail(this.emailTransport, this.config.transportOptions, obj.message, error => obj.callback && this.sendTo(obj.from, 'send', { error }, obj.callback));
        }
    }
    sendEmail(transport, options, message, callback) {
        message ||= {};
        options ||= this.config.transportOptions;
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
            }
            else {
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
            }
            else if (options.service === '1und1' || options.service === 'ionos') {
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
            }
            else if (options.service === 'Office365') {
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
            }
            else if (options.service === 'ith') {
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
            }
            else if (options.service === 'mail.ee') {
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
            transport = (0, nodemailer_1.createTransport)(options);
        }
        if (typeof message !== 'object') {
            message = { text: message };
        }
        //noinspection JSUnresolvedVariable
        message.from = message.from || this.config.defaults.from;
        //noinspection JSUnresolvedVariable
        message.to = message.to || this.config.defaults.to;
        //noinspection JSUnresolvedVariable
        message.subject = message.subject || this.config.defaults.subject;
        //noinspection JSUnresolvedVariable
        message.text = message.text || this.config.defaults.text || '';
        this.log.info(`Send email: ${JSON.stringify(message)}`);
        //noinspection JSUnresolvedFunction
        transport.sendMail(message, (error, info) => {
            if (error) {
                // adapter.log.error(`Error ${error.response}` || error.message || error.code || JSON.stringify(error));
                this.log.error(`Error ${error.response || error.message || error.code || JSON.stringify(error)}`);
                if (typeof callback === 'function') {
                    callback(error.response || error.message || error.code || JSON.stringify(error));
                }
            }
            else {
                //noinspection JSUnresolvedVariable
                this.log.info(`sent to ${message.to}`);
                this.log.debug(`Response: ${info.response}`);
                if (typeof callback === 'function') {
                    callback(null);
                }
            }
        });
        return transport;
    }
}
exports.EmailAdapter = EmailAdapter;
// If started as allInOne mode => return function to create instance
if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options) => new EmailAdapter(options);
}
else {
    // otherwise start the instance directly
    (() => new EmailAdapter())();
}
//# sourceMappingURL=main.js.map