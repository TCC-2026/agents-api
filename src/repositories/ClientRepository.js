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

export default { insert };
