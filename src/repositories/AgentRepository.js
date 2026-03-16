import prisma from '../config/prisma.js';
import LOGGER from '../utils/logger.js';

const selectAgentById = async (agentId) => {
    try {
        return await prisma.agent.findUnique({
            where: {
                id: agentId
            }
        });
    } catch (error) {
        LOGGER('error', 'Erro ao encontrar agente pelo ID: ' + agentId, error);
        throw error;
    }
};

const selectAgentByService = async (serviceName, modelVersion) => {
    try {
        return await prisma.agent.findFirst({
            where: {
                service: serviceName,
                modelVersion: modelVersion,
                isActive: true
            }
        });
    } catch (error) {
        LOGGER('error', 'Erro ao encontrar agente: ' + modelVersion, error);
        throw error;
    }
};

export default { selectAgentById, selectAgentByService };
