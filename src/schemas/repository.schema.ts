import { z } from 'zod';

export const PaginationSchema = z.object({
    page: z.string().optional().default('1').transform(Number),
    limit: z.string().optional().default('30').transform(Number),
    search: z.string().optional()
});

export const RepositorySettingsSchema = z.object({
    autoSync: z.boolean().optional(),
    agents: z.object({
        architecture: z.boolean().optional(),
        infra: z.boolean().optional(),
        commits: z.boolean().optional(),
        dependencies: z.boolean().optional()
    }).optional()
});

export const SyncTriggerSchema = z.object({
    branch: z.string()
});
