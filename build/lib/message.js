"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recipientsOf = recipientsOf;
exports.attachmentOf = attachmentOf;
exports.applyCatalogParameters = applyCatalogParameters;
/**
 * The shared catalog of message commands (message.send, message.getRecipients): its parameters mapped onto the
 * nodemailer message of `send`, and the recipients of the settings.
 */
const node_path_1 = require("node:path");
/**
 * The recipients of the settings ("to" of the defaults: one address or several separated by commas).
 *
 * @param to the recipient(s) of the settings
 * @returns one entry per address
 */
function recipientsOf(to) {
    return (to || '')
        .split(/[,;]/)
        .map(entry => entry.trim())
        .filter(entry => entry)
        .map(entry => {
        const m = entry.match(/^"?([^"<]*?)"?\s*<([^>]+)>$/);
        return m
            ? { id: m[2].trim(), name: m[1].trim() || m[2].trim(), kind: 'user', default: true }
            : { id: entry, name: entry, kind: 'user', default: true };
    });
}
/** A file name for a picture or file without one, from its MIME type (image/png → file.png) */
function fileNameFor(contentType) {
    const sub = (contentType || '').split('/')[1]?.split(/[;+]/)[0];
    return `file.${sub === 'jpeg' ? 'jpg' : sub || 'bin'}`;
}
/**
 * One `file` of the catalog as a nodemailer attachment: a data URL, base64 with `contentType` (also as
 * {data, contentType}, the answer of e.g. camera.snapshot), an iobfile:// path, an http(s) URL or a path on the host.
 *
 * @param file the file
 * @param contentType the MIME type of a bare base64 text
 * @param readFile reads a file of the ioBroker file storage
 * @returns the attachment
 */
async function attachmentOf(file, contentType, readFile) {
    if (file && typeof file === 'object' && !Buffer.isBuffer(file)) {
        const f = file;
        if (typeof f.data !== 'string') {
            // already a nodemailer attachment ({path} or {filename, content})
            return file;
        }
        return attachmentOf(f.data, f.contentType, readFile).then(a => ({
            ...a,
            filename: f.fileName || f.name || a.filename,
        }));
    }
    const text = String(file);
    const dataUrl = text.match(/^data:([^;,]+)?(?:;[^,]*)?;base64,(.*)$/s);
    if (dataUrl) {
        return { filename: fileNameFor(dataUrl[1]), content: dataUrl[2], encoding: 'base64', contentType: dataUrl[1] };
    }
    const iobFile = text.match(/^iobfile:\/\/([^/]+)\/(.+)$/i);
    if (iobFile) {
        return { filename: (0, node_path_1.basename)(iobFile[2]), content: await readFile(iobFile[1], iobFile[2]) };
    }
    if (/^https?:\/\//i.test(text)) {
        return { filename: (0, node_path_1.basename)(new URL(text).pathname) || undefined, path: text };
    }
    if (contentType) {
        return { filename: fileNameFor(contentType), content: text, encoding: 'base64', contentType };
    }
    return { path: text };
}
/**
 * The parameters of message.send on the message of `send`: recipient → to, title → subject, file and files →
 * attachments. The own names win; the catalog names are removed, nodemailer would ignore them anyway.
 *
 * @param message the message of send (changed)
 * @param readFile reads a file of the ioBroker file storage
 * @returns the message
 */
async function applyCatalogParameters(message, readFile) {
    const { file, files, contentType } = message;
    const recipient = message.recipient;
    const title = message.title;
    if (!message.to && recipient) {
        message.to = Array.isArray(recipient) ? recipient.join(', ') : String(recipient);
    }
    if (!message.subject && title) {
        message.subject = String(title);
    }
    const list = [...(file ? [file] : []), ...(Array.isArray(files) ? files : files ? [files] : [])];
    if (list.length) {
        const attachments = await Promise.all(list.map(f => attachmentOf(f, typeof contentType === 'string' ? contentType : undefined, readFile)));
        message.attachments = [...(Array.isArray(message.attachments) ? message.attachments : []), ...attachments];
    }
    for (const key of ['recipient', 'title', 'file', 'files', 'contentType']) {
        delete message[key];
    }
    return message;
}
//# sourceMappingURL=message.js.map