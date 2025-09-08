export type Severity = 'info' | 'notify' | 'alert';

/** Additional context for the notification which can be used by notification processing adapters */
interface NotificationContextData {
    /** Use a `key` specific to the adapter or if a feature is supported by all adapters of a type, the type (e.g. `messaging`) is also fine. */
    [adapterNameOrAdapterType: string]: unknown;
}

interface NotificationMessageObject {
    message: string;
    ts: number;
    contextData?: NotificationContextData;
}

interface FilteredNotificationCategory {
    description: ioBroker.Translated;
    name: ioBroker.StringOrTranslated;
    severity: Severity;
    instances: {
        [instance: string]: {
            messages: NotificationMessageObject[];
        };
    };
}

export type EmailService =
    | '1und1'
    | 'AOL'
    | 'DebugMail.io'
    | 'DynectEmail'
    | 'FastMail'
    | 'GandiMail'
    | 'Gmail'
    | 'Godaddy'
    | 'GodaddyAsia'
    | 'GodaddyEurope'
    | 'hot.ee'
    | 'Hotmail'
    | 'iCloud'
    | 'ith'
    | 'ionos'
    | 'mail.ee'
    | 'Mail.ru'
    | 'Mailgun'
    | 'Mailjet'
    | 'Mandrill'
    | 'Naver'
    | 'Office365'
    | 'OpenMailBox'
    | 'Postmark'
    | 'QQ'
    | 'QQex'
    | 'SendCloud'
    | 'SendGrid'
    | 'SES'
    | 'SES-US-EAST-1'
    | 'SES-US-WEST-2'
    | 'SES-EU-WEST-1'
    | 'Sparkpost'
    | 't-online.de'
    | 'web.de'
    | 'Yahoo'
    | 'Yandex'
    | 'Zoho'
    | '';

export type EmailTransportOptions = {
    service?: EmailService;
    auth?: {
        type?: 'OAuth2';
        clientId?: 'CLIENT_ID';
        clientSecret?: 'CLIENT_SECRET';
        refreshToken?: 'REFRESH_TOKEN';
        accessToken?: accessToken.token;
        user: string;
        pass?: string;
    };
    host?: string;
    port?: number | string;
    secure?: boolean | 'true' | 'false';
    requireTLS?: boolean | 'true' | 'false';
    ignoreTLS?: boolean;
    ignoreSslErrors?: boolean;
    domains?: string[];
    tls?: {
        ciphers?: 'SSLv3';
        rejectUnauthorized: boolean;
    };
};

export interface EmailAdapterConfig {
    transport: 'SMTP';
    transportOptions: EmailTransportOptions;
    defaults: {
        from: string;
        to: string;
        subject: string;
        text?: string;
    };
}
