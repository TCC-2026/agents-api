import db from '../config/firebase.js';
import ChatRepository from '../repositories/ChatRepository.js';
import LOGGER from '../utils/logger.js';

const getUserById = async (userId) => {
    try {
        const usersRef = db.collection('users');
        const user = await usersRef.doc(userId).get();

        if (!user.exists) return null;
        return user.id;
    } catch (error) {
        LOGGER('error', 'Erro ao buscar UID pelo telefone no Firestore:', error);
        throw error;
    }
};

const getUserIdByPhone = async (phone) => {
    try {
        // phone format expected (+5519123450000)
        const usersRef = db.collection('users');
        const user = await usersRef.where('phone', '==', phone).get();
        LOGGER('info', `Busca do usuário ${phone} retornou ${user.size} resultados do Firestore.`);

        if (user.empty) return null;
        return user.docs[0].id;
    } catch (error) {
        LOGGER('error', 'Erro ao buscar UID pelo telefone no Firestore:', error);
        throw error;
    }
};

// Despesa
const addExpense = async (session, data) => {
    try {
        // Valida e retorna userId
        const userId = await getVerifiedUserId(session);

        // Insere despesa no Firestore
        const despesasRef = db.collection('users').doc(userId).collection('transacoes');
        const docRef = await despesasRef.add({
            category: data.category || 'Outros',
            date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
            description: data.description || '',
            title: data.title || '',
            type: 'expense',
            value: Number(data.value)
        });

        LOGGER('info', `Despesa (R$ ${data.value}) inserida no Firestore para o user ${userId}`);
        return docRef.id;
    } catch (error) {
        LOGGER('error', 'Erro ao inserir despesa no Firestore:', error);
        throw error;
    }
};

// Receita
const addIncome = async (session, data) => {
    try {
        // Valida e retorna userId
        const userId = await getVerifiedUserId(session);

        // Insere receita no Firestore
        const receitasRef = db.collection('users').doc(userId).collection('transacoes');
        const docRef = await receitasRef.add({
            category: data.category || 'Outros',
            date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
            description: data.description || '',
            title: data.title || '',
            type: 'income',
            value: Number(data.value)
        });

        LOGGER('info', `Receita (R$ ${data.value}) inserida no Firestore para o user ${userId}`);
        return docRef.id;
    } catch (error) {
        LOGGER('error', 'Erro ao inserir receita no Firestore:', error);
        throw error;
    }
};

const getVerifiedUserId = async (session) => {
    try {
        let userId = await getUserById(session.firebaseUserId);

        if (!userId) {
            LOGGER('info', `Usuário com ID ${session.firebaseUserId} não encontrado no Firestore.`);
            userId = await getUserIdByPhone(session.phone);

            if (userId) {
                ChatRepository.updateSessionFirebaseUserId(session.id, userId);
            } else {
                const error = new Error(`Usuário ${session.phone} não encontrado no Firestore.`);
                error.code = 'FIRESTORE_USER_NOT_FOUND';
                throw error;
            }
        }
        return userId;
    } catch (error) {
        LOGGER('error', 'Erro ao verificar UID do usuário no Firestore:', error);
        throw error;
    }
};

export default { getUserIdByPhone, addExpense, addIncome, getUserById };
