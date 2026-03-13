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
        LOGGER('error', 'Error generating insight:', error);
        return res.status(500).json({ error: 'Erro interno do servidor.', message: error.message });
    }
};

export default { generate };
