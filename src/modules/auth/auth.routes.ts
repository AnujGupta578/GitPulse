import { type FastifyInstance } from 'fastify';
import { type PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword, createToken, verifyToken } from '../../common/auth.utils.js';
import { successResponse, errorResponse } from '../../common/response.js';

export async function authRoutes(fastify: FastifyInstance, options: PrismaClient) {
    const prisma = options;
    // Auth Routes
    fastify.post('/auth/register', async (request: any, reply) => {
        const { email, password, name } = request.body ?? {};
        if (!email || !password) return reply.status(400).send(errorResponse('Email and password are required'));
        
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return reply.status(409).send(errorResponse('An account with this email already exists'));
        
        const user = await prisma.user.create({
            data: { email, passwordHash: hashPassword(password), name: name || email.split('@')[0] }
        });
        
        return reply.status(201).send(successResponse({ message: 'Account created. Please log in.', userId: user.id }));
    });

    fastify.post('/auth/login', async (request: any, reply) => {
        const { email, password } = request.body ?? {};
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !verifyPassword(password, user.passwordHash)) return reply.status(401).send(errorResponse('Invalid credentials'));
        
        const token = createToken({ userId: user.id, email: user.email, name: user.name });
        return successResponse({ access_token: token, user: { id: user.id, email: user.email, name: user.name } });
    });

    fastify.get('/auth/me', async (request: any, reply) => {
        const auth = request.headers.authorization || '';
        const payload = verifyToken(auth.replace('Bearer ', ''));
        if (!payload) return reply.status(401).send(errorResponse('Unauthorized'));
        
        const user = await prisma.user.findUnique({ 
            where: { id: payload.userId }, 
            select: { id: true, email: true, name: true, createdAt: true } 
        });
        
        if (!user) return reply.status(401).send(errorResponse('User not found'));
        return successResponse(user);
    });
}
