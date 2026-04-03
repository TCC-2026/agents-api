import LOGGER from '../utils/logger.js';
import AssistantService from '../services/AssistantService.js';
import ChatRepository from '../repositories/ChatRepository.js';
import pkg from 'twilio';
const { twiml } = pkg;
const { MessagingResponse } = twiml;

const whatsappHandler = async (usuario, msgRecebida, audio) => {
    // Busca a sessão
    let session = await ChatRepository.findActiveSessionByPhone(usuario);
    if (!session) {
        session = await ChatRepository.createSession(
            usuario,
            'O usuário é novo no app.' // contexto
        );
    }

    // Busca o histórico de mensagens
    const rawHistory = await ChatRepository.getSessionHistory(session.id);
    const history = rawHistory.map((msg) => ({
        role: msg.role,
        content: msg.content
    }));

    // Salva a mensagem do usuário
    await ChatRepository.saveMessage(session.id, 'user', msgRecebida);

    // Chama a IA
    const responseText = await AssistantService.sendMessage(
        session.currentContext || '',
        history,
        msgRecebida,
        audio
    );

    // Salva a resposta da IA
    await ChatRepository.saveMessage(session.id, 'model', responseText);

    const twimlResponse = new MessagingResponse();
    return twimlResponse.message(responseText);
};

export default { whatsappHandler };
