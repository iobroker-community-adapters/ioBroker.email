
    export type RemoteKeys = 'REMOTE_ALIAS_IDENTIFIER/ActionSendEmail';
    type PackageType<T> = T extends 'REMOTE_ALIAS_IDENTIFIER/ActionSendEmail' ? typeof import('REMOTE_ALIAS_IDENTIFIER/ActionSendEmail') :any;