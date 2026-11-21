/** One entry of the answer of `getRecipients` */
export interface Recipient {
    /** The address, usable as `recipient` or `to` */
    id: string;
    /** The name of "Name <address>", else the address */
    name: string;
    kind: 'user';
    /** `send` without `to` goes to the recipients of the settings */
    default: true;
}
/** A nodemailer attachment as `send` takes it */
export interface Attachment {
    filename?: string;
    path?: string;
    content?: string | Buffer;
    encoding?: string;
    contentType?: string;
}
/** Reads a file of the ioBroker file storage: `id` is the adapter instance (e.g. echarts.0), `path` the file */
export type ReadFile = (id: string, path: string) => Promise<Buffer>;
/**
 * The recipients of the settings ("to" of the defaults: one address or several separated by commas).
 *
 * @param to the recipient(s) of the settings
 * @returns one entry per address
 */
export declare function recipientsOf(to: string | undefined): Recipient[];
/**
 * One `file` of the catalog as a nodemailer attachment: a data URL, base64 with `contentType` (also as
 * {data, contentType}, the answer of e.g. camera.snapshot), an iobfile:// path, an http(s) URL or a path on the host.
 *
 * @param file the file
 * @param contentType the MIME type of a bare base64 text
 * @param readFile reads a file of the ioBroker file storage
 * @returns the attachment
 */
export declare function attachmentOf(file: unknown, contentType: string | undefined, readFile: ReadFile): Promise<Attachment>;
/**
 * The parameters of message.send on the message of `send`: recipient → to, title → subject, file and files →
 * attachments. The own names win; the catalog names are removed, nodemailer would ignore them anyway.
 *
 * @param message the message of send (changed)
 * @param readFile reads a file of the ioBroker file storage
 * @returns the message
 */
export declare function applyCatalogParameters(message: Record<string, unknown>, readFile: ReadFile): Promise<Record<string, unknown>>;
