import LOGGER from '../utils/logger.js';
import ai from '../config/gemini.js';
import AgentRepository from '../repositories/AgentRepository.js';

const sendMessage = async (agent, payload) => {
    try {
        // Verifica se o agente existe
        if (!agent) throw new Error('Agente não encontrado na fila de fallback.');

        // Define o modelo a ser usado no payload
        payload.model = agent.modelVersion;

        // Envia a mensagem para a IA
        const response = await ai.models.generateContent(payload);

        // Retorna a resposta
        return {
            response: response,
            agentUsed: agent
        };
    } catch (error) {
        const isUnavailable = error.status === 503 || error.status === 'UNAVAILABLE';
        const isRateLimited = error.status === 429 || error.status === 'RESOURCE_EXHAUSTED';

        if ((isUnavailable || isRateLimited) && agent.fallbackAgentId) {
            const nextAgent = await AgentRepository.selectAgentById(agent.fallbackAgentId);
            LOGGER(
                'warn',
                `Erro 429 de limite de uso para o modelo: ${agent.modelVersion}, saltando para o modelo fallback: ${nextAgent.modelVersion}`
            );
            return await sendMessage(nextAgent, payload);
        }
        throw error;
    }
};

export default { sendMessage };
