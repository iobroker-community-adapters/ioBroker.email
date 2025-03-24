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
import type { EmailAdapterConfig, EmailTransportOptions, FilteredNotificationCategory, NotificationMessageObject } from './types';
export declare class EmailAdapter extends Adapter {
    config: EmailAdapterConfig;
    private emailTransport;
    private lastMessageTime;
    private lastMessageText;
    private systemLang;
    private microsoftToken;
    constructor(options?: Partial<AdapterOptions>);
    onStateChange(id: string, state: ioBroker.State | null | undefined): void;
    onMessage(obj: ioBroker.Message): void;
    main(): Promise<void>;
    /** Process a `sendNotification` request */
    processNotification(obj: ioBroker.Message): Promise<void>;
    /** Build up a mail object from the notification message */
    buildMessageFromNotification(message: {
        category: FilteredNotificationCategory;
        host: string;
    }): {
        subject: string;
        text: string;
    };
    /** Extract the newest message out of a notification messages together with the localized date */
    getNewestMessage(messages: NotificationMessageObject[]): string;
    processMessage(obj: ioBroker.Message): Promise<void>;
    sendEmail(options: EmailTransportOptions | null, message: {
        from?: string;
        to?: string;
        subject?: string;
        text?: string;
    } | string): Promise<string>;
}
