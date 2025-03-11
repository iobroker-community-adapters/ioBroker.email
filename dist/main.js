"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
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
const axios_1 = __importDefault(require("axios"));
const OAUTH_URL = 'https://oauth2.iobroker.in/microsoft';
class EmailAdapter extends adapter_core_1.Adapter {
    emailTransport = null;
    lastMessageTime = 0;
    lastMessageText = '';
    systemLang = 'en';
    refreshTokenTimeout;
    accessToken;
    constructor(options = {}) {
        super({
            ...options,
            name: 'email',
            ready: () => this.main(),
            message: (obj) => this.onMessage(obj),
            stateChange: (id, state) => this.onStateChange(id, state),
            unload: (callback) => {
                if (this.refreshTokenTimeout) {
                    this.clearTimeout(this.refreshTokenTimeout);
                    this.refreshTokenTimeout = undefined;
                }
                this.emailTransport?.close();
                callback();
            },
        });
    }
    onStateChange(id, state) {
        if (id.endsWith('microsoftTokens') && state?.ack) {
            if (JSON.stringify(this.accessToken) !== state.val) {
                try {
                    this.accessToken = JSON.parse(state.val);
                    this.refreshTokens().catch(error => this.log.error(`Cannot refresh tokens: ${error}`));
                }
                catch (error) {
                    this.log.error(`Cannot parse tokens: ${error}`);
                    this.accessToken = undefined;
                }
            }
        }
    }
    async refreshTokens() {
        if (this.refreshTokenTimeout) {
            this.clearTimeout(this.refreshTokenTimeout);
            this.refreshTokenTimeout = undefined;
        }
        if (!this.accessToken?.refresh_token) {
            this.log.error('No tokens for outlook and co. found');
            return;
        }
        if (!this.accessToken.access_token_expires_on ||
            new Date(this.accessToken.access_token_expires_on).getTime() < Date.now()) {
            this.log.error('Access token is expired. Please make an authorization again');
            return;
        }
        let expiresIn = new Date(this.accessToken.access_token_expires_on).getTime() - Date.now() - 180_000;
        if (expiresIn <= 0) {
            // Refresh token
            const response = await axios_1.default.post('https://oauth2.iobroker.in/microsoft', this.accessToken);
            if (response.status !== 200) {
                this.log.error(`Cannot refresh tokens: ${response.statusText}`);
                return;
            }
            this.accessToken = response.data;
            if (this.accessToken) {
                this.accessToken.access_token_expires_on = new Date(Date.now() + this.accessToken.expires_in * 1_000).toISOString();
                expiresIn = new Date(this.accessToken.access_token_expires_on).getTime() - Date.now() - 180_000;
                await this.setState('microsoftTokens', JSON.stringify(this.accessToken), true);
                this.log.debug('Tokens for outlook and co. updated');
            }
            else {
                this.log.error('No tokens for outlook and co. could be refreshed');
            }
        }
        // no longer than 10 minutes, as longer timer could be not reliable
        if (expiresIn > 600_000) {
            expiresIn = 600_000;
        }
        this.refreshTokenTimeout = this.setTimeout(() => {
            this.refreshTokenTimeout = undefined;
            this.refreshTokens().catch(error => this.log.error(`Cannot refresh tokens: ${error}`));
        }, expiresIn);
    }
    onMessage(obj) {
        if (obj?.command === 'send') {
            this.processMessage(obj).catch((err) => this.log.error(`Cannot send email: ${err.toString()}`));
        }
        else if (obj?.command === 'sendNotification') {
            this.processNotification(obj).catch((err) => this.log.error(`Cannot send notification: ${err.toString()}`));
        }
        else if (obj?.command === 'authMicrosoft') {
            (0, axios_1.default)(OAUTH_URL).then(response => {
                if (obj.callback) {
                    this.sendTo(obj.from, 'authMicrosoft', { url: response.data.authUrl }, obj.callback);
                }
                if (!response.data.authUrl) {
                    throw new Error('Cannot get authorize URL');
                }
            });
        }
    }
    async main() {
        const systemConfig = await this.getForeignObjectAsync('system.config');
        this.systemLang = systemConfig?.common?.language || 'en';
        // it must be like this
        this.config.transportOptions.auth.pass = this.decrypt('Zgfr56gFe87jJOM', this.config.transportOptions.auth.pass);
        if (this.config.transportOptions.service === 'Office365') {
            const state = await this.getStateAsync('microsoftTokens');
            if (state) {
                this.accessToken = JSON.parse(state.val);
                if (this.accessToken?.access_token_expires_on &&
                    new Date(this.accessToken.access_token_expires_on).getTime() < Date.now()) {
                    this.log.error('Access token is expired. Please make a authorization again');
                }
                else {
                    this.log.error('Only expired tokens for outlook and co. found');
                }
            }
            else {
                this.log.error('No tokens for outlook and co. found');
            }
            await this.subscribeStatesAsync('microsoftTokens');
            this.refreshTokens().catch(error => this.log.error(`Cannot refresh tokens: ${error}`));
        }
    }
    /** Process a `sendNotification` request */
    async processNotification(obj) {
        this.log.info(`New notification received from ${obj.from}`);
        const mail = this.buildMessageFromNotification(obj.message);
        await this.sendEmail(null, null, mail, error => {
            if (obj.callback) {
                this.sendTo(obj.from, 'sendNotification', { sent: !error }, obj.callback);
            }
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
    async processMessage(obj) {
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
            options.auth.pass = decodeURIComponent(options.auth.pass || '');
            delete obj.message.options;
            await this.sendEmail(null, options, obj.message, error => obj.callback && this.sendTo(obj.from, 'send', { error }, obj.callback));
        }
        else {
            this.emailTransport = await this.sendEmail(this.emailTransport, this.config.transportOptions, obj.message, error => obj.callback && this.sendTo(obj.from, 'send', { error }, obj.callback));
        }
    }
    async sendEmail(transport, options, message, callback) {
        message ||= {};
        options ||= this.config.transportOptions;
        if (!transport) {
            if (options.host === 'undefined' || options.host === 'null') {
                delete options.host;
            }
            if (options.port === 'undefined' || options.port === 'null') {
                delete options.port;
            }
            if (!options.host || !options.port) {
                if (options.host !== undefined) {
                    delete options.host;
                }
                if (options.port !== undefined) {
                    delete options.port;
                }
                if (options.secure !== undefined) {
                    delete options.secure;
                }
                if (options.requireTLS !== undefined) {
                    delete options.requireTLS;
                }
            }
            else {
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
            if (options.service === 'web.de') {
                options.domains = ['web.de'];
                options.host = 'smtp.web.de';
                options.port = '587';
                options.requireTLS = true;
                delete options.service;
            }
            else if (options.service === '1und1' || options.service === 'ionos') {
                options.host = 'smtp.ionos.de';
                options.port = '587';
                options.requireTLS = true;
                delete options.service;
            }
            else if (options.service === 'Office365') {
                options.requireTLS = true;
                options.host = 'smtp.office365.com';
                options.port = '587';
                delete options.service;
                if (!this.accessToken?.access_token) {
                    this.log.error('No tokens for outlook and co. found');
                    return null;
                }
                if (!this.accessToken.access_token_expires_on ||
                    new Date(this.accessToken.access_token_expires_on).getTime() < Date.now()) {
                    this.log.error('Access token is expired. Please make a authorization again');
                    return null;
                }
                options.auth = {
                    type: 'OAuth2',
                    user: options.auth.user || this.config.transportOptions.auth.user,
                    accessToken: this.accessToken.access_token,
                };
            }
            else if (options.service === 'ith') {
                options.tls = { ciphers: 'SSLv3', rejectUnauthorized: false };
                options.requireTLS = true;
                options.host = 'mail.ithnet.com';
                options.port = '587';
                delete options.service;
            }
            else if (options.service === 'mail.ee') {
                options.tls = { ciphers: 'SSLv3', rejectUnauthorized: false };
                options.requireTLS = true;
                options.host = 'mail.ee';
                options.port = '587';
                delete options.service;
            }
            else if (options.ignoreSslErrors) {
                options.tls = { rejectUnauthorized: true };
            }
            else {
                options.tls = { rejectUnauthorized: false };
            }
            transport = (0, nodemailer_1.createTransport)(options);
        }
        if (typeof message !== 'object') {
            message = { text: message };
        }
        if (message.from !== (options.auth.user || this.config.transportOptions.auth.user)) {
            if (options.host === 'smtp.office365.com') {
                message.from = options.auth.user || this.config.transportOptions.auth.user;
            }
            else {
                this.log.warn('From email address is not equal to the configured email address for authentication. Some services do not allow this!');
            }
        }
        else {
            message.from = message.from || this.config.defaults.from;
        }
        message.to = message.to || this.config.defaults.to;
        message.subject = message.subject || this.config.defaults.subject;
        message.text = message.text || this.config.defaults.text || '';
        this.log.info(`Send email: ${JSON.stringify(message)}`);
        transport.sendMail(message, (error, info) => {
            if (error) {
                this.log.error(`Error ${error.response || error.message || error.code || JSON.stringify(error)}`);
                if (typeof callback === 'function') {
                    callback(error.response || error.message || error.code || JSON.stringify(error));
                }
            }
            else {
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