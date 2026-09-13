import LOGGER from '../utils/logger.js';
import ChatRepository from '../repositories/ChatRepository.js';

const clearSession = async (phone) => {
    try {
        const session = await ChatRepository.findSessionByPhone(phone);

        if (!session) {
            const error = new Error(`Nenhuma sessão encontrada para o telefone ${phone}.`);
            error.code = 'SESSION_NOT_FOUND';
            throw error;
        }

        await ChatRepository.clearMessages(session.id);
    } catch (error) {
        LOGGER('error', 'Erro no serviço ao limpar sessão:', error);
        throw error;
    }
};

const deleteAccount = async (phone) => {
    try {
        // O onDelete: Cascade no schema do Prisma já remove as mensagens
        // junto com a sessão, não é necessário limpar antes.
        await ChatRepository.deleteSessionByPhone(phone);
    } catch (error) {
        LOGGER('error', 'Erro no serviço ao excluir conta:', error);
        throw error;
    }
};

export default { clearSession, deleteAccount };
