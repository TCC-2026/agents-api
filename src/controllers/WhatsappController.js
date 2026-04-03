import pkg from 'twilio';
const { twiml } = pkg;
const { MessagingResponse } = twiml;

import WhatsappService from '../services/WhatsappService.js';
import LOGGER from '../utils/logger.js';

const whatsappWebHook = async (req, res) => {
    try {
        const msgRecebida = req.body.Body;
        const usuario = req.body.From; // ex: 'whatsapp:+5511999999999'
        const mediaUrl = req.body.MediaUrl0;
        const mimeType = req.body.MediaContentType0;
        let base64Audio = null;

        if (mediaUrl && mimeType && mimeType.startsWith('audio/')) {
            base64Audio = await audioHandler(mediaUrl, mimeType);
        }

        LOGGER('info', `Mensagem recebida do WhatsApp (${usuario}): ${msgRecebida}.`);

        // Envia mensagem para a IA e recebe a resposta formatada
        const twimlResponse = await WhatsappService.whatsappHandler(
            usuario,
            msgRecebida,
            base64Audio
        );

        // Responde para a Twilio
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twimlResponse.toString());
    } catch (error) {
        LOGGER('error', 'Erro no Webhook do WhatsApp:', error);

        const twimlResponse = new MessagingResponse();
        twimlResponse.message(
            'Desculpe, meu sistema está passando por uma pequena instabilidade no momento. Pode tentar de novo em alguns minutos? 🛠️'
        );

        res.writeHead(500, { 'Content-Type': 'text/xml' });
        res.end(twimlResponse.toString());
    }
};

const audioHandler = async (mediaUrl, mimeType) => {
    LOGGER('info', `Mensagem de áudio recebida. URL: ${mediaUrl}, Tipo: ${mimeType}`);

    const twilioAuth = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
    ).toString('base64');

    const audioResponse = await fetch(mediaUrl, {
        headers: {
            Authorization: `Basic ${twilioAuth}`
        }
    });

    const arrayBuffer = await audioResponse.arrayBuffer();
    return Buffer.from(arrayBuffer).toString('base64');
};

export default { whatsappWebHook };
