import LOGGER from '../utils/logger.js';
import ClientRepository from '../repositories/ClientRepository.js';

const apiKeyMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res
                .status(401)
                .json({ error: 'Token de autenticação não fornecido ou mal formatado.' });
        }

        const token = authHeader.split(' ')[1];
        const client = await ClientRepository.selectByApiKey(token);

        if (!client || client.apiKey !== token) {
            return res.status(401).json({ error: 'API Key inválida.' });
        }

        next();
    } catch (error) {
        LOGGER('error', 'Error in apiKeyMiddleware:', error);
        return res
            .status(500)
            .json({ error: 'Erro interno na autenticação da requisição.', message: error.message });
    }
};

export default apiKeyMiddleware;
