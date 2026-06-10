import LOGGER from '../utils/logger.js';
import AssistantService from '../services/AssistantService.js';
import ChatRepository from '../repositories/ChatRepository.js';
import FinanceRepository from '../repositories/FinanceRepository.js';

const processMessage = async (contactPhone, messageText, mediaData) => {
    let session;

    try {
        // Busca a sessão
        session = await ChatRepository.findActiveSessionByPhone(contactPhone);
        if (!session) {
            const firebaseUserId = await FinanceRepository.getUserIdByPhone(contactPhone);

            if (!firebaseUserId) {
                const error = new Error(`Número ${contactPhone} não encontrado no Firebase.`);
                error.code = 'FIREBASE_USER_ID_NOT_FOUND';
                throw error;
            }

            const userContext = await FinanceRepository.getUserContext(firebaseUserId);

            session = await ChatRepository.createSession(
                contactPhone,
                userContext,
                firebaseUserId
            );
            LOGGER('info', `Sessão ${session.id} criada (Firebase User ID: ${firebaseUserId}).`);
        } else {
            const freshContext = await FinanceRepository.getUserContext(session.firebaseUserId);
            session.currentContext = freshContext;
        }
    } catch (error) {
        LOGGER('error', 'Error in whatsapp service finding session:', error);
        throw error;
    }

    try {
        // Busca o histórico de mensagens
        const history = await ChatRepository.getSessionHistory(session.id);
        LOGGER('info', `Sessão ${session.id}. ${history.length} mensagens:`, history);

        // Salva a mensagem do usuário
        const messageToSave = messageText + (mediaData ? ` [Mídia ${mediaData.mimeType}]` : '');
        await ChatRepository.saveMessage(session.id, 'user', messageToSave.trimStart());

        // Chama a IA
        const response = await AssistantService.callAgent(session, history, messageText, mediaData);

        // Salva a resposta de texto da IA
        if (response.text) {
            await ChatRepository.saveMessage(session.id, 'model', response.text, response.agentId);
        }

        return response.text;
    } catch (error) {
        LOGGER('error', 'Error in whatsapp service processing message:', error);
        throw error;
    }
};

export default { processMessage };
