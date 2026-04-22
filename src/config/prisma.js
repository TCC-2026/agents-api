import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

let connectionString = process.env.DATABASE_URL;

if (connectionString && !connectionString.includes('sslmode=require')) {
    const separador = connectionString.includes('?') ? '&' : '?';
    connectionString = `${connectionString}${separador}sslmode=require`;
}

const adapter = new PrismaPg({
    connectionString: connectionString
});

const prisma = new PrismaClient({ adapter });

export default prisma;
