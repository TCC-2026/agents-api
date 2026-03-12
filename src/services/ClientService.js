import crypto from 'crypto';
import ClientRepository from '../repositories/ClientRepository.js';
import LOGGER from '../utils/logger.js';

const createClient = async (name) => {
   try {
      const apiKey = crypto.randomBytes(32).toString('hex');

      return await ClientRepository.insert(name, apiKey);
   } catch (error) {
      LOGGER('error', 'Error in service registering client:', error);
      throw error;
   }
};

export default createClient;
