import type { GitProviderAdapter, RepositoryMetadata, BranchMetadata } from './GitProviderAdapter.js';

export interface GitHubUserProfile {
    id: string;
    login: string;
    name: string;
    email: string;
    avatarUrl: string;
}

export class GitHubAdapter implements GitProviderAdapter {
    private readonly apiUrl = 'https://api.github.com';
    private readonly clientId = process.env.GITHUB_CLIENT_ID || '';
    private readonly clientSecret = process.env.GITHUB_CLIENT_SECRET || '';

    private async request<T>(endpoint: string, token: string, options: RequestInit = {}): Promise<T> {
        const response = await fetch(`${this.apiUrl}${endpoint}`, {
            ...options,
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                ...options.headers,
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub API Error: ${response.status} - ${await response.text()}`);
        }

        return response.json() as Promise<T>;
    }

    async fetchUserProfile(accessToken: string): Promise<GitHubUserProfile> {
        const data = await this.request<any>('/user', accessToken);
        return {
            id: data.id.toString(),
            login: data.login,
            name: data.name || data.login,
            email: data.email || '',
            avatarUrl: data.avatar_url
        };
    }

    async fetchRepositories(accessToken: string, page = 1, limit = 50): Promise<RepositoryMetadata[]> {
        const data = await this.request<any[]>(`/user/repos?sort=updated&per_page=${limit}&page=${page}&affiliation=owner,collaborator,organization_member`, accessToken);
        return data.map(repo => this.mapToMetadata(repo));
    }

    async fetchAllRepositories(accessToken: string): Promise<RepositoryMetadata[]> {
        const all: RepositoryMetadata[] = [];
        let page = 1;
        while (true) {
            const batch = await this.fetchRepositories(accessToken, page, 100);
            all.push(...batch);
            if (batch.length < 100) break;
            page++;
        }
        return all;
    }

    async fetchRepository(accessToken: string, owner: string, repo: string): Promise<RepositoryMetadata> {
        const data = await this.request<any>(`/repos/${owner}/${repo}`, accessToken);
        return this.mapToMetadata(data);
    }

    async fetchBranches(accessToken: string, owner: string, repo: string): Promise<BranchMetadata[]> {
        const data = await this.request<any[]>(`/repos/${owner}/${repo}/branches`, accessToken);
        return data.map(b => ({
            name: b.name,
            sha: b.commit.sha
        }));
    }

    async fetchBranch(accessToken: string, owner: string, repo: string, branch: string): Promise<BranchMetadata> {
        const data = await this.request<any>(`/repos/${owner}/${repo}/branches/${branch}`, accessToken);
        return {
            name: data.name,
            sha: data.commit.sha
        };
    }

    async registerWebhook(accessToken: string, owner: string, repo: string, targetUrl: string, secret: string): Promise<string> {
        const data = await this.request<any>(`/repos/${owner}/${repo}/hooks`, accessToken, {
            method: 'POST',
            body: JSON.stringify({
                name: 'web',
                active: true,
                events: ['push', 'pull_request', 'repository'],
                config: {
                    url: targetUrl,
                    content_type: 'json',
                    secret: secret,
                    insecure_ssl: '0'
                }
            })
        });
        return data.id.toString();
    }

    async exchangeCodeForToken(code: string, redirectUri: string): Promise<{ accessToken: string; refreshToken?: string; scopes: string; expiresAt?: Date }> {
        const response = await fetch(`https://github.com/login/oauth/access_token`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                code,
                redirect_uri: redirectUri
            })
        });

        if (!response.ok) {
            throw new Error('Failed to exchange code for GitHub token');
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(`GitHub OAuth Error: ${data.error_description}`);
        }

        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            scopes: data.scope,
            expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined
        };
    }

    async fetchFileTree(accessToken: string, owner: string, repo: string, sha: string): Promise<{ path: string; type: 'blob' | 'tree'; sha: string; size?: number }[]> {
        const data = await this.request<any>(`/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`, accessToken);
        return data.tree.map((t: any) => ({
            path: t.path,
            type: t.type,
            sha: t.sha,
            size: t.size
        }));
    }

    async fetchFileContent(accessToken: string, owner: string, repo: string, path: string, ref?: string): Promise<string> {
        const url = `/repos/${owner}/${repo}/contents/${path}${ref ? `?ref=${ref}` : ''}`;
        const data = await this.request<any>(url, accessToken);
        if (data.encoding === 'base64') {
            return Buffer.from(data.content, 'base64').toString('utf8');
        }
        return data.content;
    }

    async fetchCommitDetails(accessToken: string, owner: string, repo: string, sha: string): Promise<{ sha: string; files: { filename: string; additions: number; deletions: number; changes: number }[] }> {
        const data = await this.request<any>(`/repos/${owner}/${repo}/commits/${sha}`, accessToken);
        return {
            sha: data.sha,
            files: data.files.map((f: any) => ({
                filename: f.filename,
                additions: f.additions,
                deletions: f.deletions,
                changes: f.changes
            }))
        };
    }

    async fetchCommits(accessToken: string, owner: string, repo: string, branch: string, limit = 100): Promise<any[]> {
        const data = await this.request<any[]>(`/repos/${owner}/${repo}/commits?sha=${branch}&per_page=${limit}`, accessToken);
        return data.map((c: any) => ({
            sha: c.sha,
            author: c.commit.author.name,
            message: c.commit.message,
            timestamp: c.commit.author.date
        }));
    }

    private mapToMetadata(repo: any): RepositoryMetadata {
        return {
            id: repo.id.toString(),
            name: repo.name,
            fullName: repo.full_name,
            isPrivate: repo.private,
            defaultBranch: repo.default_branch,
            url: repo.html_url,
            language: repo.language,
            description: repo.description,
            owner: repo.owner.login
        };
    }
}
