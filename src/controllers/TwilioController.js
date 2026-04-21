import LOGGER from '../utils/logger.js';
import TwilioService from '../services/TwilioService.js';
import WhatsappService from '../services/WhatsappService.js';

const webhook = async (req, res) => {
    try {
        const message = req.body.Body;
        const contactPhone = req.body.From.replace('whatsapp:', ''); // ex: 'whatsapp:+5511999999999'
        const mediaUrl = req.body.MediaUrl0;
        const mimeType = req.body.MediaContentType0;

        LOGGER('info', `Mensagem recebida do WhatsApp (${contactPhone}): ${message}.`);
        res.status(200).send('OK');

        // Continuar o processamento assíncrono em background
        backgroundProcess(contactPhone, message, mediaUrl, mimeType);
    } catch (error) {
        LOGGER('error', 'Erro crítico no Webhook do WhatsApp:', error);

        if (!res.headersSent) {
            res.status(500).send('Erro interno do servidor');
        }
    }
};

const backgroundProcess = async (contactPhone, message, mediaUrl, mimeType) => {
    try {
        // Baixa a mídia
        let media = null;
        if (mediaUrl && mimeType) media = await TwilioService.downloadMedia(mediaUrl, mimeType);

        // Recebe resposta formatada da IA
        const aiResponseText = await WhatsappService.processMessage(contactPhone, message, media);

        // Responde para a Twilio
        LOGGER('info', 'Enviando resposta via Twilio:', aiResponseText);
        await TwilioService.callbackMessage(contactPhone, aiResponseText);
    } catch (error) {
        LOGGER('error', 'Error in backgroundProcess:', error);
        throw error;
    }
};

export default { webhook };
