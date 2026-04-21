import LOGGER from '../utils/logger.js';
import AssistantService from '../services/AssistantService.js';
import ChatRepository from '../repositories/ChatRepository.js';
import FinanceRepository from '../repositories/FinanceRepository.js';
import pkg from 'twilio';
const { twiml } = pkg;
const { MessagingResponse } = twiml;

const whatsappHandler = async (usuario, msgRecebida, mediaData) => {
    // Busca a sessão
    let session = await ChatRepository.findActiveSessionByPhone(usuario);
    if (!session) {
        const firebaseUserId = await FinanceRepository.getUserIdByPhone(usuario);
        session = await ChatRepository.createSession(
            usuario,
            'O usuário é novo no app.',
            firebaseUserId
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
    const response = await AssistantService.sendMessage(
        session.currentContext || '',
        history,
        msgRecebida,
        mediaData,
        session.firebaseUserId
    );

    // Salva a resposta da IA
    await ChatRepository.saveMessage(session.id, 'model', response.text, response.agentId);

    const twimlResponse = new MessagingResponse();
    return twimlResponse.message(response.text);
};

export default { whatsappHandler };
