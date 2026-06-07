import prisma from '../config/prisma.js';
import LOGGER from '../utils/logger.js';

const findActiveSessionByPhone = async (phone) => {
    try {
        return await prisma.session.findFirst({
            where: {
                phone: phone,
                status: 'ACTIVE'
            }
        });
    } catch (error) {
        LOGGER('error', `Erro ao buscar sessão ativa para o telefone ${phone}:`, error);
        throw error;
    }
};

const createSession = async (phone, context = '', firebaseUserId = null) => {
    try {
        return await prisma.session.create({
            data: {
                phone: phone,
                status: 'ACTIVE',
                currentContext: context,
                firebaseUserId: firebaseUserId
            }
        });
    } catch (error) {
        LOGGER('error', `Erro ao criar nova sessão para o telefone ${phone}:`, error);
        throw error;
    }
};

const saveMessage = async (sessionId, role, content, agentId = null) => {
    try {
        return await prisma.message.create({
            data: {
                sessionId: sessionId,
                role: role, // 'user', 'assistant' ou 'model'
                content: content,
                agentId: agentId
            }
        });
    } catch (error) {
        LOGGER('error', `Erro ao salvar mensagem na sessão ${sessionId}:`, error);
        throw error;
    }
};

const getSessionHistory = async (sessionId) => {
    try {
        const messages = await prisma.message.findMany({
            where: {
                sessionId: sessionId
            },
            orderBy: {
                createdAt: 'desc' // Traz da mais recente para a mais antiga
            },
            take: 50 // Limite de segurança
        });

        return buildHistory(messages.reverse());
    } catch (error) {
        LOGGER('error', `Erro ao buscar histórico da sessão ${sessionId}:`, error);
        throw error;
    }
};

const buildHistory = (mensagensDoBanco) => {
    return mensagensDoBanco.map(msg => {
        
        // Mensagens normais de texto
        if (msg.role === 'user' || msg.role === 'model') {
            return {
                role: msg.role,
                parts: [{ text: msg.content }]
            };
        }

        // functionCalls
        if (msg.role === 'functionCall') {
            const callsArray = JSON.parse(msg.content);
            
            return {
                role: 'model',
                parts: callsArray.map(call => ({
                    functionCall: {
                        name: call.name,
                        args: call.args
                    }
                }))
            };
        }

        // functionResponse
        if (msg.role === 'functionResponse') {
            return JSON.parse(msg.content);
        }
    });
};

const updateSessionFirebaseUserId = async (sessionId, firebaseUserId) => {
    try {
        return await prisma.session.update({
            where: { id: sessionId },
            data: {
                firebaseUserId: firebaseUserId,
                messages: {
                    deleteMany: {} // Limpa o histórico
                }
            }
        });
    } catch (error) {
        LOGGER('error', `Erro ao atualizar Firebase User ID da sessão ${sessionId}:`, error);
        throw error;
    }
};

const closeSession = async (sessionId) => {
    try {
        return await prisma.session.update({
            where: { id: sessionId },
            data: { status: 'CLOSED' }
        });
    } catch (error) {
        LOGGER('error', `Erro ao encerrar a sessão ${sessionId}:`, error);
        throw error;
    }
};

export default {
    findActiveSessionByPhone,
    createSession,
    saveMessage,
    getSessionHistory,
    closeSession,
    updateSessionFirebaseUserId
};
