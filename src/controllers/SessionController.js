import phoneSchema from '../schemas/sessionSchema.js';
import SessionService from '../services/SessionService.js';
import LOGGER from '../utils/logger.js';

const clearSession = async (req, res) => {
    try {
        const validation = phoneSchema.safeParse(req.body);

        if (!validation.success) {
            const errorMessage = validation.error.issues[0].message;
            return res.status(400).json({ error: errorMessage });
        }

        const { phone } = validation.data;
        await SessionService.clearSession(phone);

        return res.status(200).json({ message: 'Sessão limpa com sucesso.' });
    } catch (error) {
        LOGGER('error', 'Error clearing session:', error);

        if (error.code === 'SESSION_NOT_FOUND') {
            return res.status(404).json({ error: 'Nenhuma sessão encontrada para este telefone.' });
        }

        return res.status(500).json({ error: 'Erro interno do servidor.', message: error.message });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const validation = phoneSchema.safeParse(req.body);

        if (!validation.success) {
            const errorMessage = validation.error.issues[0].message;
            return res.status(400).json({ error: errorMessage });
        }

        const { phone } = validation.data;
        await SessionService.deleteAccount(phone);

        return res.status(200).json({ message: 'Conta excluída com sucesso.' });
    } catch (error) {
        LOGGER('error', 'Error deleting account:', error);

        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Nenhuma sessão encontrada para este telefone.' });
        }

        return res.status(500).json({ error: 'Erro interno do servidor.', message: error.message });
    }
};

export default { clearSession, deleteAccount };
