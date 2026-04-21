import LOGGER from '../utils/logger.js';
import AssistantService from '../services/AssistantService.js';
import ChatRepository from '../repositories/ChatRepository.js';
import FinanceRepository from '../repositories/FinanceRepository.js';

const processMessage = async (contactPhone, messageText, mediaData) => {
    try {
        // Busca a sessão
        let session = await ChatRepository.findActiveSessionByPhone(contactPhone);
        if (!session) {
            const firebaseUserId = await FinanceRepository.getUserIdByPhone(contactPhone);
            session = await ChatRepository.createSession(
                contactPhone,
                'O usuário é novo no app.',
                firebaseUserId
            );
            LOGGER('info', `Sessão ${session.id} criada (Firebase User ID: ${firebaseUserId}).`);
        }

        // Busca o histórico de mensagens
        const rawHistory = await ChatRepository.getSessionHistory(session.id);
        const history = rawHistory
            .map((msg) => ({
                role: msg.role,
                content: msg.content
            }))
            .reverse();
        LOGGER('info', `Sessão ${session.id}. ${history.length} mensagens:`, history);

        // Salva a mensagem do usuário
        await ChatRepository.saveMessage(session.id, 'user', messageText);

        // Chama a IA
        const response = await AssistantService.sendMessage(
            session.currentContext || '',
            history,
            messageText,
            mediaData,
            session.firebaseUserId
        );

        // Salva a resposta da IA
        await ChatRepository.saveMessage(session.id, 'model', response.text, response.agentId);

        return response.text;
    } catch (error) {
        LOGGER('error', 'Error in whatsapp service:', error);
        throw error;
    }
};

export default { processMessage };
