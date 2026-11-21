"use strict";
/**
 * The answer of `help`: what the instance answers, written for an AI agent (e.g. ioBroker.pi-agent, or the MCP
 * server with `send_to`) and for script authors. Keep it in sync with `onMessage` in main.ts.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HELP = exports.COMMANDS = void 0;
/**
 * Every command `onMessage` answers; `write: true` = it has an effect (sends an email); `standard` = it follows the
 * shared catalog of commands for adapter families (message.*)
 */
exports.COMMANDS = [
    { command: 'help', write: false },
    { command: 'send', write: true, standard: 'message.send' },
    { command: 'getRecipients', write: false, standard: 'message.getRecipients' },
    { command: 'sendNotification', write: true },
    { command: 'authMicrosoft', write: false },
];
exports.HELP = `ioBroker.email: sends emails through the SMTP account of the settings (a service such as Gmail, Office365, web.de,
or an own server). It cannot read emails. An agent can send an email to the user or, on request, to other addresses.
send and getRecipients follow the shared catalog of message commands (message.send, message.getRecipients).

Commands (sendTo email.0):
- send {to?, subject?, text?, html?, from?, attachments?, options?} or just a text (= the body): sends an email;
  answer {result: the response of the mail server, ok: true, sent: the number of accepted recipients} or {error,
  reason?}.
  to: one address or several separated by commas; default: the recipient of the settings (usually the user).
  subject, text: default the subject and the text of the settings. html: the body as HTML (instead of or besides
  text). from: the sender; default the sender of the settings; some services (Office365 always) only allow the
  address of the account.
  attachments: [{path, filename?, cid?}] or [{filename, content}]; path = a file on the ioBroker host or an
  http(s) URL; cid: to show a picture inside html with <img src="cid:...">.
  The names of the shared catalog work too: recipient (= to), title (= subject), file and files (more
  attachments: a data URL, base64 text with contentType, {data, contentType, fileName?} as camera snapshots and
  charts answer it, a URI iobfile://<adapter.0>/<path> of the ioBroker files, an http(s) URL or a path on the
  host). to, subject and attachments win when both are given.
  The message goes to nodemailer unchanged, so cc, bcc, replyTo, priority (high, normal, low) and the other fields
  of a nodemailer message work too.
  options: another SMTP account for this one email instead of the settings: {service?, host?, port?, secure?,
  requireTLS?, auth: {user, pass}}.
  The same message again within 1 s is dropped; answer {error, reason: "DUPLICATE"}.
- getRecipients {}: the recipient(s) of the settings (nothing is sent); answer {recipients: [{id: the address,
  name, kind: "user", default: true}]}.
- sendNotification: for the notification-manager (sends the notification to the recipient of the settings);
  answer {sent, error?}.
- help: this text and the list of commands {help, commands: [{command, write, standard?}]}.
- authMicrosoft: for the settings (login to Office365), not for agents.
Other commands are answered with {error, reason: "NOT_SUPPORTED"}.

How to talk to the user:
- Without to the email goes to the recipient of the settings; ask for the address when the user means someone
  else and did not give it. Never guess or invent an address.
- Sending to other people than the user only on the user's explicit request; show recipient, subject and text
  before sending such an email.
- Tell the user whether it was sent; on {error} give the reason (e.g. login refused by the mail server).`;
//# sourceMappingURL=help.js.map