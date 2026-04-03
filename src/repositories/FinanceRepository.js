import db from '../config/firebase.js';
import LOGGER from '../utils/logger.js';

const getUserIdByPhone = async (twilioPhone) => {
    try {
        // Formato do Twilio (whatsapp:+5519123450000)
        // cleanPhone (19123450000)
        const cleanPhone = twilioPhone.replace('whatsapp:', '').replace('+55', '');

        const usersRef = db.collection('users');
        const user = await usersRef.where('phone', '==', cleanPhone).get();

        if (user.empty) return null;
        return user.docs[0].id;
    } catch (error) {
        LOGGER('error', 'Erro ao buscar UID pelo telefone no Firestore:', error);
        throw error;
    }
};

// Despesa
const addExpense = async (userId, data) => {
    try {
        const despesasRef = db.collection('users').doc(userId).collection('despesas');

        const docRef = await despesasRef.add({
            category: data.category || 'Outros',
            date: new Date().toISOString(),
            description: data.description || '',
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
const addIncome = async (userId, data) => {
    try {
        const receitasRef = db.collection('users').doc(userId).collection('receitas');

        const docRef = await receitasRef.add({
            category: data.category || 'Outros',
            date: new Date().toISOString(),
            description: data.description || '',
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

export default { getUserIdByPhone, addExpense, addIncome };
