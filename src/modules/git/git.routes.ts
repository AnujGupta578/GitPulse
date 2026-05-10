import { type FastifyInstance } from 'fastify';
import { type PrismaClient } from '@prisma/client';
import { createToken } from '../../common/auth.utils.js';
import { successResponse, errorResponse } from '../../common/response.js';

const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

export async function gitRoutes(fastify: FastifyInstance, options: { prisma: PrismaClient, triggerSync: (userId: string, token: string) => Promise<void> }) {
    const { prisma, triggerSync } = options;
    // GitHub OAuth
    fastify.get('/api/auth/github/connect', async (_req, reply) => {
        const clientId = process.env.GITHUB_CLIENT_ID || '';
        const redirectUri = process.env.GITHUB_REDIRECT_URI || 'http://localhost:8000/api/auth/github/callback';
        const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,read:user,read:org`;
        return reply.redirect(url);
    });

    fastify.get('/api/auth/github/callback', async (request: any, reply) => {
        const { code } = request.query;
        if (!code) return reply.status(400).send(errorResponse('Missing code'));
        
        try {
            const { GitHubAdapter } = await import('../../core/git/GitHubAdapter.js');
            const github = new GitHubAdapter();
            const tokenData = await github.exchangeCodeForToken(code, process.env.GITHUB_REDIRECT_URI || 'http://localhost:8000/api/auth/github/callback');
            const profile = await github.fetchUserProfile(tokenData.accessToken);
            
            const user = await prisma.user.upsert({
                where: { email: `github:${profile.id}` },
                update: { name: profile.name },
                create: { email: `github:${profile.id}`, passwordHash: 'oauth-no-password', name: profile.name }
            });
            
            await (prisma as any).connectedAccount.upsert({
                where: { provider_providerAccountId: { provider: 'GITHUB', providerAccountId: profile.id } },
                update: { accessToken: tokenData.accessToken, username: profile.login },
                create: { userId: user.id, provider: 'GITHUB', providerAccountId: profile.id, username: profile.login, accessToken: tokenData.accessToken }
            });
            
            const sessionToken = createToken({ userId: user.id, email: user.email, name: user.name });
            triggerSync(user.id, tokenData.accessToken).catch(() => {});
            
            return reply.redirect(`${FRONTEND_URL}/auth/callback?token=${encodeURIComponent(sessionToken)}&user=${encodeURIComponent(profile.login)}`);
        } catch (error: any) {
            return reply.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(error.message)}`);
        }
    });
}
