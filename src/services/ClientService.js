import prisma from '../utils/prisma.js';
import crypto from 'crypto';

const createClient = async (name) => {

    try {
        const apiKey = crypto.randomBytes(32).toString('hex');

        return await prisma.client.create({
            data: {
                name: name,
                apiKey: apiKey
            }
        });

    } catch (error) {
        console.error("Error creating client:", error);
        throw error;
    }

};

export default createClient;