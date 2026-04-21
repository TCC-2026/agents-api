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
        let mediaData = null;

        if (mediaUrl && mimeType) {
            mediaData = await mediaHandler(mediaUrl, mimeType);
        }

        LOGGER('info', `Mensagem recebida do WhatsApp (${usuario}): ${msgRecebida}.`);

        // Envia mensagem para a IA e recebe a resposta formatada
        const twimlResponse = await WhatsappService.whatsappHandler(
            usuario,
            msgRecebida,
            mediaData
        );

        // Responde para a Twilio
        LOGGER('info', `Resposta: ${twimlResponse}`);
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

const mediaHandler = async (mediaUrl, mimeType) => {
    LOGGER('info', `Baixando mídia do WhatsApp: ${mediaUrl} [${mimeType}]`);

    const twilioAuth = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
    ).toString('base64');

    const mediaResponse = await fetch(mediaUrl, {
        headers: {
            Authorization: `Basic ${twilioAuth}`
        }
    });

    if (!mediaResponse.ok) {
        throw new Error(`Twilio recusou o download: ${mediaResponse.statusText}`);
    }

    const arrayBuffer = await mediaResponse.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    return {
        mimeType: mimeType,
        data: base64Data
    };
};

export default { whatsappWebHook };
