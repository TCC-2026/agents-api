import prisma from '../config/prisma.js';
import LOGGER from '../utils/logger.js';

const insert = async (name, apiKey) => {
    try {
        return await prisma.client.create({
            data: {
                name: name,
                apiKey: apiKey
            }
        });
    } catch (error) {
        LOGGER('error', 'Error in repository registering client: ', error);
        throw error;
    }
};

const selectByApiKey = async (apiKey) => {
    try {
        return await prisma.client.findUnique({
            where: {
                apiKey: apiKey
            }
        });
    } catch (error) {
        LOGGER('error', 'Error in repository finding client by API Key: ', error);
        throw error;
    }
};

export default { insert, selectByApiKey };
