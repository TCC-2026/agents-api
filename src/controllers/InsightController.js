import insightSchema from '../schemas/insightSchema.js';
import InsightService from '../services/InsightService.js';
import LOGGER from '../utils/logger.js';

const generate = async (req, res) => {
    try {
        const validation = insightSchema.safeParse(req.body);

        if (!validation.success) {
            const errorMessage = validation.error.issues[0].message;
            return res.status(400).json({ error: errorMessage });
        }

        const { context } = validation.data;
        const response = await InsightService.generate(context);

        return res.status(200).json({ insight: response });
    } catch (error) {
        if (error.status == 429) {
            LOGGER('warn', 'Limite de requisições atingido: ', error);
            return res
                .status(429)
                .json({ error: 'Limite de requisições atingido.', message: error.message });
        }
        LOGGER('error', 'Erro gerando insight: ', error);
        return res.status(500).json({ error: 'Erro interno do servidor.', message: error.message });
    }
};

export default { generate };
