export const VERSION = '1.0.0';

export interface RepositoryMetadata {
    id: string;
    name: string;
    fullName: string;
    isPrivate: boolean;
    defaultBranch: string;
    url: string;
    language?: string;
    description?: string;
    owner: string;
}

export interface BranchMetadata {
    name: string;
    sha: string;
}

export interface GitProviderAdapter {
    /**
     * Fetch a list of repositories accessible by the connected account
     */
    fetchRepositories(accessToken: string, page?: number, limit?: number): Promise<RepositoryMetadata[]>;

    /**
     * Fetch metadata for a specific repository
     */
    fetchRepository(accessToken: string, owner: string, repo: string): Promise<RepositoryMetadata>;

    /**
     * Fetch branches for a repository
     */
    fetchBranches(accessToken: string, owner: string, repo: string): Promise<BranchMetadata[]>;

    /**
     * Register a webhook for real-time syncing
     */
    registerWebhook(accessToken: string, owner: string, repo: string, targetUrl: string, secret: string): Promise<string>;

    /**
     * Exchange an OAuth code for an access token
     */
    exchangeCodeForToken(code: string, redirectUri: string): Promise<{ accessToken: string; refreshToken?: string; scopes: string; expiresAt?: Date }>;
}
