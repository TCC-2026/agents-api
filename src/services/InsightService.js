import LOGGER from '../utils/logger.js';
import ai from '../config/gemini.js';
import AgentRepository from '../repositories/AgentRepository.js';

const sendMessage = async (agent, context, hoje) => {
    if (!agent) {
        throw new Error('Agente não encontrado na fila de fallback.');
    }

    try {
        LOGGER(
            'info',
            `Tentando gerar insight com modelo: ${agent.modelVersion}: `,
            agent.prompt.replace('${hoje}', hoje)
        );

        const response = await ai.models.generateContent({
            model: agent.modelVersion,
            contents: `Contexto do usuário: ${context}`,
            config: {
                tools: [{ googleSearch: {} }],
                temperature: agent.temperature,
                systemInstruction: agent.prompt.replace('${hoje}', hoje)
            }
        });

        return response.text;
    } catch (error) {
        if (error.status === 429 && agent.fallbackAgentId) {
            const nextAgent = await AgentRepository.selectAgentById(agent.fallbackAgentId);
            LOGGER(
                'warn',
                `Erro 429 de limite de uso para o modelo: ${agent.modelVersion}. Saltando para o modelo fallback: ${nextAgent.modelVersion}`
            );
            return await sendMessage(nextAgent, context, hoje);
        }
        throw error;
    }
};

const generate = async (context) => {
    try {
        const hoje = new Date().toLocaleDateString('pt-BR');

        const primaryAgent = await AgentRepository.selectAgentByService(
            'Insight',
            process.env.PRIMARY_INSIGHT_MODEL
        );

        if (!primaryAgent) {
            throw new Error(
                `Agente primário (${process.env.PRIMARY_INSIGHT_MODEL}) não encontrado no banco.`
            );
        }

        return await sendMessage(primaryAgent, context, hoje);
    } catch (error) {
        LOGGER('error', 'Erro ao gerar insight: ', error);
        throw error;
    }
};

export default { generate };
