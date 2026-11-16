![Logo](admin/email.png)
# ioBroker email

![Number of Installations](http://iobroker.live/badges/email-installed.svg)
![Number of Installations](http://iobroker.live/badges/email-stable.svg)
[![NPM version](http://img.shields.io/npm/v/iobroker.email.svg)](https://www.npmjs.com/package/iobroker.email)

![Test and Release](https://github.com/ioBroker/ioBroker.email/workflows/Test%20and%20Release/badge.svg)
[![Translation status](https://weblate.iobroker.net/widgets/adapters/-/email/svg-badge.svg)](https://weblate.iobroker.net/engage/adapters/?utm_source=widget)
[![Downloads](https://img.shields.io/npm/dm/iobroker.email.svg)](https://www.npmjs.com/package/iobroker.email)

Send emails from ioBroker. You cannot check emails with this adapter, only send them.

The adapter uses [nodemailer](https://github.com/nodemailer/nodemailer) to provide the functionality.

**This adapter uses Sentry libraries to automatically report exceptions and code errors to the developers.** For more details and for information how to disable the error reporting see [Sentry-Plugin Documentation](https://github.com/ioBroker/plugin-sentry#plugin-sentry)! Sentry reporting is used starting with js-controller 3.0.

**IMPORTANT:**
You may have to enter your credentials once again when migrating from release 1.x.x to 2.x.x if you encounter connection problems. 

## Email Provider Specific Notes

### Gmail
**Important:** If you have Two-Factor Authentication (2FA) enabled on your Gmail account, you **must** use an App Password instead of your regular Gmail password. This has always been required by nodemailer for Gmail with 2FA.

To set up Gmail with 2FA:
1. Enable 2-Step Verification in your Google Account settings
2. Generate an App Password specifically for ioBroker email adapter
3. Use your Gmail address as username and the generated App Password as password in the adapter configuration

For accounts without 2FA, you may need to configure "Allow Less Secure Apps" in your Gmail account settings. You also may need to unlock your account with "Allow access to your Google account" to use SMTP.

### mail.ee
For mail.ee email service, **do not** use your normal webmail login credentials. Instead:

- **Username**: Use your complete email address (e.g., `username@mail.ee`)
- **Password**: Use the special IMAP/SMTP password (not your webmail password)
  - To find your IMAP/SMTP password: Log into your mail.ee webmail account and visit [https://posti.mail.ee/prefs?group=enable_pop3](https://posti.mail.ee/prefs?group=enable_pop3)

## Usage

To send email from ScriptEngine just write:

```js
// send email to all instances of email adapter
sendTo('email', 'Email body');

// send email to specific instance of email adapter
sendTo("email.1", 'Email body');

// To specify subject or other options
sendTo('email', {
    from:    'iobroker@mydomain.com',
    to:      'aabbcc@gmail.com, xxyyzz@gmail.com', // comma separated multiple recipients.
    subject: 'Message from ioBroker',
    text:    'This is test email to you!',
});

// To send attachments
sendTo('email', {
    attachments: [
        {
            path: '/pathToImage/picture1.jpg', // use file on disk as attachment
        },
        {
            filename: 'license.txt',
            path: 'https://raw.github.com/andris9/Nodemailer/master/LICENSE', // use URL as an attachment
        },
    ]
});

// To send in html format
sendTo('email', {
    html: '<p>Embedded image: <img src='cid:image1'/></p>',
    attachments:[
        {
            path: 'path/to/file/image1.jpg',
            cid: 'image1',
        },
    ]
});
```

To send email from another adapter, use `adapter.sendTo` function.


## SMTP troubleshooting

Check the adapter version and use one mailbox you control. Do not include household data,
device details, real alarm content, attachments or credentials in a diagnostic message.

### Check the saved transport first

For a custom relay, select **User defined** and enter its documented host, port and authentication
settings. A selected named service takes priority over stored host/port values.

For a relay that requires STARTTLS on port 587, leave **SSL connection** off, enable
**Always use STARTTLS** and enable **Check SSL certificate**. Implicit TLS, commonly on port 465,
is a different mode and must follow the provider's instructions. Do not fix a certificate error
by disabling validation: check the hostname, certificate chain and system clock instead.

The internal `ignoreSslErrors` option name is historical: in the current custom-transport path,
`true` enables certificate verification. Prefer the current **Check SSL certificate** UI label
when reviewing the saved configuration.

### Follow one synthetic message

Use a specific instance and replace the example addresses with your authorized sender and own
recipient. This sends a real email; run it once in an isolated test setup. It uses the saved
instance transport, without per-message `options` overrides.

```js
sendTo('email.0', 'send', {
    from: 'sender@example.com',
    to: 'recipient@example.net',
    subject: 'ioBroker SMTP diagnostic - unique test ID',
    text: 'Synthetic diagnostic message. No household or device data.',
}, result => {
    if (result && result.error) {
        log('SMTP attempt failed; review the adapter log locally.', 'warn');
    } else {
        log('Adapter callback received; inspect the SMTP response and recipient mailbox.');
    }
});
```

Interpret the evidence in order:

1. Confirm the script ran, selected the intended instance and reached the callback. The adapter
   filters identical message objects received within one second; avoid loops and repeated clicks.
2. Inspect adapter logs locally for a connection, TLS, authentication or recipient error. A callback
   alone is not success: check its `error` field and the adapter's SMTP response.
3. A successful SMTP response means that the next server accepted the message. It does not prove
   arrival in the inbox or that anyone read it. Check later delivery failures and relay logs where
   available before deciding whether another attempt is necessary.
4. Inspect the owned recipient mailbox, including filtering folders, and correlate the unique test
   subject and time. Redact addresses, host/device identifiers, message bodies and authentication
   material before sharing diagnostics publicly.

SMTP Senpai is an optional custom-relay example: use the host and credentials supplied for your
account, port 587 with STARTTLS, certificate checking enabled and a verified sender domain.
See its [SMTP configuration reference](https://en.mailsenpai.com/smtp-api/).
This documentation contribution comes from its operator, MailSenpai; it is not a native adapter
preset, maintainer endorsement or a claim of runtime-tested compatibility. The diagnostic
sequence also applies to other relays using their own documented settings.

## Supported services
- 1und1 / ionos
- AOL
- DebugMail.io
- DynectEmail
- FastMail
- GandiMail
- Gmail
- Godaddy
- GodaddyAsia
- GodaddyEurope
- hot.ee
- Hotmail
- iCloud
- ith
- mail.ee
- Mail.ru
- Mailgun
- Mailjet
- Mandrill
- Naver
- Office365
- OpenMailBox
- Postmark
- QQ
- QQex
- SendCloud
- SendGrid
- SES
- SES-US-EAST-1
- SES-US-WEST-2
- SES-EU-WEST-1
- t-online.de
- Sparkpost
- Yahoo
- Yandex
- Zoho
- User specific (Server, port and security defined manually)

For other services see documentation of **Nodemailer**: `[https://github.com/nodemailer/nodemailer](https://github.com/nodemailer/nodemailer)`

## Changelog
<!--
  Placeholder for the next version (at the beginning of the line):
  ### **WORK IN PROGRESS**
-->
### **WORK IN PROGRESS**
* (MailSenpai) Documented custom SMTP troubleshooting with a synthetic, single-recipient example

### 3.1.1 (2026-11-15)
* (mcm1957) Adapter requires node.js >= 22.19.0, admin >= 8.1.0 and js-controller >= 7.2.4 now
* (mcm1957) Dependencies have been updated

### 3.1.0 (2026-10-26)
* (@GermanBluefox) Migrated the build script (`tasks.js` => `tasks.mts`) to TypeScript
* (@GermanBluefox) Migrated blockly to TypeScript
* (@GermanBluefox) Fixed Office365: emails sent from scripts or other adapters failed after the first email, because the access token was not refreshed (#653)
* (@GermanBluefox) A selected service has now priority over the stored host and port
* (@GermanBluefox) Fixed the translations of the settings dialog and added Ukrainian to the Blockly block
* (@GermanBluefox) The password is stored encrypted now and is not readable by other adapters. An existing password is encrypted automatically on the first start (#715)
* (@GermanBluefox) Renamed the option "Ignore SSL certificate errors" to "Check SSL certificate", because that is what it actually does
* (@GermanBluefox) Removed the unused dependency `googleapis`

### 3.0.0 (2026-08-03)
* (copilot) Adapter requires node.js >= 22 now
* (copilot) Adapter requires admin >= 8.0.0 now
* (copilot) Adapter requires js-controller >= 6.0.11 now
* (@copilot) Set up GitHub Copilot instructions with centralized ioBroker template (v0.5.7) and weekly monitoring workflow
* (@ipod86) Added configurable number of file attachments to the Blockly email block via plus/minus buttons
* (@GermanBluefox) Migrated to admin 8

### 2.0.5-alpha.0 (2025-10-06)
* (@copilot) Fixed SMTP relay anonymous access by ignoring user and password when empty
* (@copilot) Fixed Office365 OAuth email sending from scripts by ensuring fresh tokens are used
* (mcm1957) Dependencies have been updated

### 2.0.4 (2025-04-15)
* (@mcm1957) `From email address is not equal to the configured email address for authentication.` changed to debug level.
* (mcm1957) Dependencies have been updated

## License

The MIT License (MIT)

Copyright (c) 2014-2026 bluefox

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
