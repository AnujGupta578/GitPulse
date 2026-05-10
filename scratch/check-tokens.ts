import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkTokens() {
    const accounts = await prisma.connectedAccount.findMany();
    console.log(`Found ${accounts.length} accounts`);
    accounts.forEach(a => {
        console.log(`ID: ${a.id}, Provider: ${a.provider}, Token Length: ${a.accessToken?.length}, Format: ${a.accessToken?.includes(':') ? 'IV:DATA' : 'DATA-ONLY'}`);
        if (a.accessToken?.includes(':')) {
            const [iv, data] = a.accessToken.split(':');
            console.log(`  IV Length (hex): ${iv.length}, Data Length (hex): ${data.length}`);
        }
    });
    process.exit(0);
}

checkTokens();
