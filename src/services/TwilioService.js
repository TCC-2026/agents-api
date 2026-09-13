import LOGGER from '../utils/logger.js';
import twilioClient from '../config/twilio.js';

const downloadMedia = async (mediaUrl, mimeType) => {
    try {
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
    } catch (error) {
        LOGGER('error', 'Error in twilio service downloading media:', error);
        throw error;
    }
};

const sendTypingIndicator = async (messageSid) => {
    if (!messageSid) return;

    try {
        const twilioApiAuth = Buffer.from(
            `${process.env.TWILIO_API_KEY}:${process.env.TWILIO_API_SECRET}`
        ).toString('base64');

        const response = await fetch('https://messaging.twilio.com/v3/Indicators/Typing.json', {
            method: 'POST',
            headers: {
                Authorization: `Basic ${twilioApiAuth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                channel: 'WHATSAPP',
                messageId: messageSid
            })
        });

        if (!response.ok) {
            throw new Error(`Twilio recusou o indicador de digitação: ${response.statusText}`);
        }
    } catch (error) {
        // Recurso apenas visual (Public Beta) — não deve interromper o fluxo de resposta.
        LOGGER('warn', 'Erro ao enviar indicador de digitação via Twilio:', error);
    }
};

const callbackMessage = async (to, text) => {
    try {
        await twilioClient.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER, // 'whatsapp:+14155238886'
            to: 'whatsapp:' + to,
            body: text
        });
        LOGGER('info', `Mensagem enviada assíncronamente para ${to} via API.`);
    } catch (error) {
        LOGGER('error', `Erro ao enviar mensagem assíncrona via Twilio: `, error);
        throw error;
    }
};

export default { downloadMedia, callbackMessage, sendTypingIndicator };
