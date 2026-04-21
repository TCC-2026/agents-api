import LOGGER from '../utils/logger.js';
import pkg from 'twilio';
const { validateRequest } = pkg;

const twilioAuth = (req, res, next) => {
    try {
        const twilioSignature = req.headers['x-twilio-signature'];
        const webhookUrl = process.env.TWILIO_WEBHOOK_URL;
        const authToken = process.env.TWILIO_AUTH_TOKEN;

        const isValidated = validateRequest(authToken, twilioSignature, webhookUrl, req.body);

        if (!isValidated) {
            LOGGER('warn', 'Tentativa de acesso bloqueada! Assinatura Twilio inválida.');
            return res.status(403).send('Acesso negado. Assinatura inválida.');
        }
        next();
    } catch (error) {
        LOGGER('error', 'Error in twilioAuth: ', error);
        return res.status(500).json({
            error: 'Erro interno na autenticação da requisição da Twilio.',
            message: error.message
        });
    }
};

export default twilioAuth;
