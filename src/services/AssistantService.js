import LOGGER from '../utils/logger.js';
import ai from '../config/gemini.js';
import AgentRepository from '../repositories/AgentRepository.js';

const sendMessage = async (context, history, message) => {
    try {
        LOGGER('info', 'Iniciando o serviço de Assistant');

        const hoje = new Date().toLocaleDateString('pt-BR');
        const agent = await AgentRepository.selectAgentByService(
            'Assistant',
            process.env.PRIMARY_ASSISTANT_MODEL
        );

        if (!agent) {
            throw new Error(
                `Agente (${process.env.PRIMARY_ASSISTANT_MODEL}) não encontrado no banco.`
            );
        }
        const prompt = agent.prompt.replace('${hoje}', hoje);
        const instructions =
            prompt + ' \n DADOS DE SISTEMA - CONTEXTO ATUAL DO USUÁRIO: \n\n' + context;

        let content = [];

        if (history) {
            content = history.map((msg) => ({
                role: msg.role === 'assistant' ? 'model' : msg.role,
                parts: [{ text: msg.content }]
            }));
        }

        content.push({
            role: 'user',
            parts: [{ text: message }]
        });

        const payload = {
            model: agent.modelVersion,
            contents: content,
            config: {
                temperature: agent.temperature,
                systemInstruction: instructions
            }
        };

        LOGGER('info', `Enviando mensagem para o Assistant: `, payload);
        const response = await ai.models.generateContent(payload);
        return response.text;
    } catch (error) {
        LOGGER('error', 'Erro no serviço de envio da requisição para a IA: ', error);
        throw error;
    }
};

export default { sendMessage };
