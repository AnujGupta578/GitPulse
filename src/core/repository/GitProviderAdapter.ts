export interface IRepositoryMetadata {
    id: string;
    name: string;
    fullName: string;
    url: string;
    defaultBranch: string;
    isPrivate: boolean;
}

export interface IGitProviderAdapter {
    /**
     * Authenticates with the provider using the provided token.
     */
    authenticate(token: string): Promise<boolean>;

    /**
     * Fetches a list of repositories accessible by the authenticated user.
     */
    listRepositories(): Promise<IRepositoryMetadata[]>;

    /**
     * Validates if a specific repository is accessible.
     */
    validateAccess(repoName: string): Promise<boolean>;

    /**
     * Sets up a webhook on the provider for continuous synchronization.
     */
    setupWebhook(repoName: string, targetUrl: string, secret: string): Promise<string>;
}

/**
 * Placeholder implementation for GitHub.
 * In production, this would use @octokit/rest.
 */
export class GitHubAdapter implements IGitProviderAdapter {
    private token: string | null = null;

    async authenticate(token: string): Promise<boolean> {
        this.token = token;
        // Mock verification
        return token.startsWith("ghp_");
    }

    async listRepositories(): Promise<IRepositoryMetadata[]> {
        if (!this.token) throw new Error("Not authenticated");
        // Mock data representing a GitHub API response
        return [
            {
                id: "repo-1",
                name: "api-gateway",
                fullName: "org/api-gateway",
                url: "https://github.com/org/api-gateway",
                defaultBranch: "main",
                isPrivate: true
            },
            {
                id: "repo-2",
                name: "auth-service",
                fullName: "org/auth-service",
                url: "https://github.com/org/auth-service",
                defaultBranch: "develop",
                isPrivate: true
            }
        ];
    }

    async validateAccess(repoName: string): Promise<boolean> {
        return !!this.token;
    }

    async setupWebhook(repoName: string, targetUrl: string, secret: string): Promise<string> {
        return `webhook-${Date.now()}`;
    }
}
