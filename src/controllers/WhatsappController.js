import pkg from 'twilio';
const { twiml } = pkg;
const { MessagingResponse } = twiml;

import WhatsappService from '../services/WhatsappService.js';
import LOGGER from '../utils/logger.js';

const whatsappWebHook = async (req, res) => {
    try {
        const msgRecebida = req.body.Body; // O que o usuário escreveu
        const usuario = req.body.From; // O número de quem enviou (ex: 'whatsapp:+5511999999999')

        LOGGER('info', `Mensagem recebida do WhatsApp (${usuario}): ${msgRecebida}`);

        // Envia mensagem para a IA e recebe a resposta formatada
        const twimlResponse = await WhatsappService.whatsappHandler(usuario, msgRecebida);

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

export default { whatsappWebHook };
