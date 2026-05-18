import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("GitPulse Database Audit started...");
    
    const repos = await prisma.repository.findMany({
        include: {
            branches: true
        }
    });

    console.log(`Found ${repos.length} repositories in the database.`);
    
    for (const repo of repos) {
        console.log(`\nRepository ID: ${repo.id}`);
        console.log(`Name: ${repo.name}`);
        console.log(`Provider: ${repo.provider}`);
        console.log(`Sync Status: ${repo.syncStatus}`);
        console.log(`Connection Status: ${repo.connectionStatus}`);
        console.log(`Branches count: ${repo.branches.length}`);
        
        for (const branch of repo.branches) {
            console.log(`  - Branch Name: ${branch.name}`);
            console.log(`    isDefault: ${branch.isDefault}`);
            console.log(`    Sync Status: ${branch.syncStatus}`);
            console.log(`    sha: ${branch.sha}`);
        }
    }
    
    const syncJobs = await prisma.syncJob.findMany({
        orderBy: { startedAt: 'desc' },
        take: 5
    });
    console.log(`\nRecent Sync Jobs:`, syncJobs);
}

main()
    .catch(e => {
        console.error("Database query failed:", e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
