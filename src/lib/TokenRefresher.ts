import axios from 'axios';

export interface AccessTokens {
    access_token: string;
    expires_in: number;
    access_token_expires_on: string;
    ext_expires_in: number;
    token_type: 'Bearer';
    scope: string;
    refresh_token: string;
}

export class TokenRefresher {
    private readonly adapter: ioBroker.Adapter;
    private readonly stateName: string;
    private refreshTokenTimeout: ioBroker.Timeout | undefined;
    private accessToken: AccessTokens | undefined;
    private readonly url: string;
    private readonly readyPromise: Promise<void>;

    constructor(adapter: ioBroker.Adapter, stateName: string, oauthURL: string) {
        this.adapter = adapter;
        this.stateName = stateName;
        this.url = oauthURL;

        this.readyPromise = this.adapter.getStateAsync(this.stateName).then(state => {
            if (state) {
                this.accessToken = JSON.parse(state.val as string);
                if (
                    this.accessToken?.access_token_expires_on &&
                    new Date(this.accessToken.access_token_expires_on).getTime() < Date.now()
                ) {
                    this.adapter.log.error('Access token is expired. Please make a authorization again');
                } else {
                    this.adapter.log.debug('Access token for outlook and co. found');
                }
            } else {
                this.adapter.log.error('No tokens for outlook and co. found');
            }
            this.adapter
                .subscribeStatesAsync(this.stateName)
                .catch(error => this.adapter.log.error(`Cannot read tokens: ${error}`));

            return this.refreshTokens().catch(error => this.adapter.log.error(`Cannot refresh tokens: ${error}`));
        });
    }

    destroy(): void {
        if (this.refreshTokenTimeout) {
            this.adapter.clearTimeout(this.refreshTokenTimeout);
            this.refreshTokenTimeout = undefined;
        }
    }

    onStateChange(id: string, state: ioBroker.State | null | undefined): void {
        if (state?.ack && id.endsWith(`.${this.stateName}`)) {
            if (JSON.stringify(this.accessToken) !== state.val) {
                try {
                    this.accessToken = JSON.parse(state.val as string);
                    this.refreshTokens().catch(error => this.adapter.log.error(`Cannot refresh tokens: ${error}`));
                } catch (error) {
                    this.adapter.log.error(`Cannot parse tokens: ${error}`);
                    this.accessToken = undefined;
                }
            }
        }
    }

    async getAccessToken(): Promise<string | undefined> {
        await this.readyPromise;
        if (!this.accessToken?.access_token) {
            this.adapter.log.error('No tokens for outlook and co. found');
            return undefined;
        }
        if (
            !this.accessToken.access_token_expires_on ||
            new Date(this.accessToken.access_token_expires_on).getTime() < Date.now()
        ) {
            this.adapter.log.error('Access token is expired. Please make a authorization again');
            return undefined;
        }
        return this.accessToken.access_token;
    }

    private async refreshTokens(): Promise<void> {
        if (this.refreshTokenTimeout) {
            this.adapter.clearTimeout(this.refreshTokenTimeout);
            this.refreshTokenTimeout = undefined;
        }

        if (!this.accessToken?.refresh_token) {
            this.adapter.log.error('No tokens for outlook and co. found');
            return;
        }

        if (
            !this.accessToken.access_token_expires_on ||
            new Date(this.accessToken.access_token_expires_on).getTime() < Date.now()
        ) {
            this.adapter.log.error('Access token is expired. Please make an authorization again');
            return;
        }

        let expiresIn = new Date(this.accessToken.access_token_expires_on).getTime() - Date.now() - 180_000;

        if (expiresIn <= 0) {
            // Refresh token
            const response = await axios.post(this.url, this.accessToken);
            if (response.status !== 200) {
                this.adapter.log.error(`Cannot refresh tokens: ${response.statusText}`);
                return;
            }

            this.accessToken = response.data;

            if (this.accessToken) {
                this.accessToken.access_token_expires_on = new Date(
                    Date.now() + this.accessToken.expires_in * 1_000,
                ).toISOString();
                expiresIn = new Date(this.accessToken.access_token_expires_on).getTime() - Date.now() - 180_000;
                await this.adapter.setState(this.stateName, JSON.stringify(this.accessToken), true);
                this.adapter.log.debug('Tokens for outlook and co. updated');
            } else {
                this.adapter.log.error('No tokens for outlook and co. could be refreshed');
            }
        }

        // no longer than 10 minutes, as longer timer could be not reliable
        if (expiresIn > 600_000) {
            expiresIn = 600_000;
        }

        this.refreshTokenTimeout = this.adapter.setTimeout(() => {
            this.refreshTokenTimeout = undefined;
            this.refreshTokens().catch(error => this.adapter.log.error(`Cannot refresh tokens: ${error}`));
        }, expiresIn);
    }

    async getAuthUrl(): Promise<string> {
        if (!this.url) {
            throw new Error('No OAuth URL provided');
        }
        try {
            const response = await axios(this.url);
            return response.data.authUrl;
        } catch (error) {
            throw new Error(`Cannot get authorize URL: ${error}`);
        }
    }

    static async getAuthUrl(url: string): Promise<string> {
        if (!url) {
            throw new Error('No OAuth URL provided');
        }
        try {
            const response = await axios(url);
            return response.data.authUrl;
        } catch (error) {
            throw new Error(`Cannot get authorize URL: ${error}`);
        }
    }
}
