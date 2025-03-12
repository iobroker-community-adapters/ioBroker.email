export interface AccessTokens {
    access_token: string;
    expires_in: number;
    access_token_expires_on: string;
    ext_expires_in: number;
    token_type: 'Bearer';
    scope: string;
    refresh_token: string;
}
export declare class TokenRefresher {
    private readonly adapter;
    private readonly stateName;
    private refreshTokenTimeout;
    private accessToken;
    private readonly url;
    constructor(adapter: ioBroker.Adapter, stateName: string, oauthURL?: string);
    destroy(): void;
    onStateChange(id: string, state: ioBroker.State | null | undefined): void;
    getAccessToken(): string | undefined;
    private refreshTokens;
    static getAuthUrl(url: string): Promise<string>;
}
