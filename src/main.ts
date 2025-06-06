/**
 *
 *      ioBroker email Adapter
 *
 *      (c) 2014-2025 bluefox <dogafox@gmail.com>
 *
 *      MIT License
 *
 */
import { Adapter, type AdapterOptions } from '@iobroker/adapter-core';
import type {
    EmailAdapterConfig,
    EmailTransportOptions,
    FilteredNotificationCategory,
    NotificationMessageObject,
} from './types';
import { createTransport, type Transporter } from 'nodemailer';
import { TokenRefresher } from './lib/TokenRefresher';
const OAUTH_URL = 'https://oauth2.iobroker.in/microsoft';

export class EmailAdapter extends Adapter {
    declare public config: EmailAdapterConfig;
    private emailTransport: Transporter<any, any> | null = null;
    private lastMessageTime = 0;
    private lastMessageText = '';
    private systemLang: ioBroker.Languages = 'en';
    private microsoftToken: TokenRefresher | undefined;

    public constructor(options: Partial<AdapterOptions> = {}) {
        super({
            ...options,
            name: 'email',
            ready: () => this.main(),
            message: (obj: ioBroker.Message) => this.onMessage(obj),
            stateChange: (id, state) => this.onStateChange(id, state),
            unload: (callback: () => void): void => {
                this.microsoftToken?.destroy();
                this.emailTransport?.close();

                callback();
            },
        });
    }

    onStateChange(id: string, state: ioBroker.State | null | undefined): void {
        this.microsoftToken?.onStateChange(id, state);
    }

    onMessage(obj: ioBroker.Message): void {
        if (obj?.command === 'send') {
            this.processMessage(obj).catch(error => this.log.error(`Cannot process message: ${error}`));
        } else if (obj?.command === 'sendNotification') {
            this.processNotification(obj).catch(error => this.log.error(`Cannot process message: ${error}`));
        } else if (obj?.command === 'authMicrosoft') {
            TokenRefresher.getAuthUrl(OAUTH_URL)
                .then(url => {
                    if (obj.callback) {
                        this.sendTo(obj.from, 'authMicrosoft', { url }, obj.callback);
                    }
                })
                .catch(error => {
                    this.log.error(`Cannot get authorize URL: ${error}`);
                });
        }
    }

    async main(): Promise<void> {
        const systemConfig = await this.getForeignObjectAsync('system.config');
        this.systemLang = systemConfig?.common?.language || 'en';

        if (this.config.transportOptions.service === 'Office365') {
            this.microsoftToken = new TokenRefresher(this, 'microsoftTokens', OAUTH_URL);
        }
    }

    /** Process a `sendNotification` request */
    async processNotification(obj: ioBroker.Message): Promise<void> {
        this.log.info(`New notification received from ${obj.from}`);

        const mail = this.buildMessageFromNotification(obj.message);
        try {
            await this.sendEmail(null, mail);
            if (obj.callback) {
                this.sendTo(obj.from, 'sendNotification', { sent: true }, obj.callback);
            }
        } catch (error) {
            this.log.error(`Error sending notification: ${error}`);
            if (obj.callback) {
                this.sendTo(obj.from, 'sendNotification', { sent: false, error: error.toString() }, obj.callback);
            }
        }
    }

    /** Build up a mail object from the notification message */
    buildMessageFromNotification(message: { category: FilteredNotificationCategory; host: string }): {
        subject: string;
        text: string;
    } {
        let subject: string;
        if (typeof message.category.name === 'object') {
            subject = message.category.name[this.systemLang] || message.category.name.en;
        } else {
            subject = message.category.name;
        }
        const { instances } = message.category;

        const readableInstances = Object.entries(instances).map(([instance, entry]) => {
            if (instance.startsWith('system.host.')) {
                return `${instance.substring('system.host.'.length)}: ${this.getNewestMessage(entry.messages)}`;
            }

            return `${instance.substring('system.adapter.'.length)}: ${this.getNewestMessage(entry.messages)}`;
        });

        let description: string;
        if (typeof message.category.description === 'object') {
            description = message.category.description[this.systemLang] || message.category.description.en;
        } else {
            description = message.category.description;
        }
        const text = `${description}

${message.host}:   
${readableInstances.join('\n')}
    `;

        return { subject, text };
    }

    /** Extract the newest message out of a notification messages together with the localized date */
    getNewestMessage(messages: NotificationMessageObject[]): string {
        const newestMessage = messages.sort((a, b) => (a.ts < b.ts ? 1 : -1))[0];

        return `${new Date(newestMessage.ts).toLocaleString()} ${newestMessage.message}`;
    }

    async processMessage(obj: ioBroker.Message): Promise<void> {
        if (!obj?.message) {
            return;
        }

        // filter out a double message
        const json = JSON.stringify(obj.message);
        if (this.lastMessageTime && this.lastMessageText === json && Date.now() - this.lastMessageTime < 1000) {
            return this.log.debug(
                `Filter out double message [first was for ${Date.now() - this.lastMessageTime}ms]: ${json}`,
            );
        }

        this.lastMessageTime = Date.now();
        this.lastMessageText = json;

        try {
            let response: string | undefined;
            if (obj.message.options) {
                const options: EmailTransportOptions = JSON.parse(JSON.stringify(obj.message.options));
                options.secure = options.secure === 'true' || options.secure === true;
                options.requireTLS = options.requireTLS === 'true' || options.requireTLS === true;
                options.auth.pass = decodeURIComponent(options.auth.pass || '');
                delete obj.message.options;
                response = await this.sendEmail(options, obj.message);
            } else {
                response = await this.sendEmail(null, obj.message);
            }
            if (obj.callback) {
                this.sendTo(obj.from, 'send', { result: response }, obj.callback);
            }
        } catch (error) {
            this.log.error(`Cannot send email: ${error}`);
            if (obj.callback) {
                this.sendTo(obj.from, 'send', { error: error.toString() }, obj.callback);
            }
        }
    }

    async sendEmail(
        options: EmailTransportOptions | null,
        message:
            | {
                  from?: string;
                  to?: string;
                  subject?: string;
                  text?: string;
              }
            | string,
    ): Promise<string> {
        message ||= {};

        options ||= this.config.transportOptions;

        let transport: Transporter<any, any>;
        if (options || !this.emailTransport) {
            const useStandardTransport = !options;
            options ||= this.config.transportOptions;
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
            } else {
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
            } else if (options.service === '1und1' || options.service === 'ionos') {
                options.host = 'smtp.ionos.de';
                options.port = '587';
                options.requireTLS = true;

                delete options.service;
            } else if (options.service === 't-online.de') {
                options.host = 'securesmtp.t-online.de';
                options.port = '465';
                options.requireTLS = true;

                delete options.service;
            } else if (options.service === 'Office365') {
                options.requireTLS = true;
                options.host = 'smtp.office365.com';
                options.port = '587';
                delete options.service;

                const accessToken = await this.microsoftToken?.getAccessToken();
                if (!accessToken) {
                    this.log.error('No tokens for outlook and co. found');
                    throw new Error('No tokens for outlook and co. found');
                }

                options.auth = {
                    type: 'OAuth2',
                    user: options.auth.user || this.config.transportOptions.auth.user,
                    accessToken,
                };
            } else if (options.service === 'ith') {
                options.tls = { ciphers: 'SSLv3', rejectUnauthorized: false };
                options.requireTLS = true;
                options.host = 'mail.ithnet.com';
                options.port = '587';

                delete options.service;
            } else if (options.service === 'mail.ee') {
                options.tls = { ciphers: 'SSLv3', rejectUnauthorized: false };
                options.requireTLS = true;
                options.host = 'mail.ee';
                options.port = '587';

                delete options.service;
            } else if (options.ignoreSslErrors) {
                options.tls = { rejectUnauthorized: true };
            } else {
                options.tls = { rejectUnauthorized: false };
            }

            transport = createTransport(options as any);

            if (useStandardTransport) {
                this.emailTransport = transport;
            }
        } else {
            transport = this.emailTransport;
        }

        if (typeof message !== 'object') {
            message = { text: message };
        }

        if (message.from !== (options.auth.user || this.config.transportOptions.auth.user)) {
            if (options.host === 'smtp.office365.com') {
                message.from = options.auth.user || this.config.transportOptions.auth.user;
            } else {
                this.log.debug(
                    'From email address is not equal to the configured email address for authentication. Some services do not allow this!',
                );
                message.from = message.from || this.config.defaults.from;
            }
        } else {
            message.from = message.from || this.config.defaults.from;
        }
        message.to = message.to || this.config.defaults.to;
        message.subject = message.subject || this.config.defaults.subject;
        message.text = message.text || this.config.defaults.text || '';

        this.log.info(`Send email: ${JSON.stringify(message)}`);

        return new Promise<string>((resolve, reject) =>
            transport.sendMail(message, (error: any, info: any): void => {
                if (error) {
                    this.log.error(`Error ${error.response || error.message || error.code || JSON.stringify(error)}`);
                    reject(new Error(error.response || error.message || error.code || JSON.stringify(error)));
                } else {
                    this.log.info(`sent to ${message.to}`);
                    this.log.debug(`Response: ${info.response}`);
                    resolve(info.response);
                }
            }),
        );
    }
}

// If started as allInOne mode => return function to create instance
if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<AdapterOptions> | undefined) => new EmailAdapter(options);
} else {
    // otherwise start the instance directly
    (() => new EmailAdapter())();
}
