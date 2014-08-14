ioBroker.email
==============

Send emails from ioBroker. 
To send email from ScriptEngine just write: 
```javascript
// send email to all instances of email adapter
sendTo("email", "Email body");

// send email to specific instance of email adapter
sendTo("email.1", "Email body");

// To specify subject or other options
sendTo("email", {
    from:    "iobroker@mydomain.com",
    to:      "aabbcc@gmail.com",
    subject: "Message from ioBroker",
    text:    "This is test email to you!"
});
```

To send email from other adapter use **adapter.sendTo** function.

Supported services:
- 1und1
- AOL
- DynectEmail
- FastMail
- Gmail
- Godaddy
- GodaddyAsia
- GodaddyEurope
- hot.ee
- Hotmail
- iCloud
- mail.ee
- Mail.ru
- Mailgun
- Mailjet
- Mandrill
- Postmark
- QQ
- QQex
- SendCloud
- SendGrid
- SES
- Yahoo
- Yandex
- Zoho


For other services see documentation of **Nodemailer**: https://github.com/andris9/Nodemailer
