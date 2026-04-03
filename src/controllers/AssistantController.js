import assistantSchema from '../schemas/assistantSchema.js';
import AssistantService from '../services/AssistantService.js';
import LOGGER from '../utils/logger.js';

const conversation = async (req, res) => {
    try {
        LOGGER('info', 'Requisição recebida: ', req.body);

        const bodyValid = assistantSchema.safeParse(req.body);
        const { context, history, message } = bodyValid.data;

        const response = await AssistantService.sendMessage(context, history, message, null);

        LOGGER('info', 'Resposta gerada com sucesso: ', response);
        return res.status(200).json({ response });
    } catch (error) {
        if (error.status == 429) {
            LOGGER('warn', 'Limite de requisições atingido: ', error);
            return res
                .status(429)
                .json({ error: 'Limite de requisições atingido.', message: error.message });
        }
        LOGGER('error', 'Erro ao enviar mensagem para o assistente: ', error);
        return res.status(500).json({ error: 'Erro interno do servidor.', message: error.message });
    }
};

export default { conversation };
