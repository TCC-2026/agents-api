import LOGGER from '../utils/logger.js';
import AgentRepository from '../repositories/AgentRepository.js';
import AiService from './AiService.js';
import { availableTools, getGeminiToolsDeclaration } from '../tools/index.js';

const callAgent = async (context, history, message, media, firebaseUserId) => {
    try {
        LOGGER('info', 'Iniciando o serviço de Assistant');

        const hoje = new Date().toLocaleDateString('pt-BR');
        const agent = await AgentRepository.selectAgentByService(
            'Assistant',
            process.env.PRIMARY_ASSISTANT_MODEL
        );

        if (!agent) {
            throw new Error(
                `Agente (${process.env.PRIMARY_ASSISTANT_MODEL}) não encontrado no banco.`
            );
        }

        const prompt = agent.prompt.replace('${hoje}', hoje);
        const instructions =
            prompt + ' \n DADOS DE SISTEMA - CONTEXTO ATUAL DO USUÁRIO: \n\n' + context;
        const content = constructContent(history, message, media);

        const payload = {
            model: agent.modelVersion,
            contents: content,
            config: {
                temperature: agent.temperature,
                systemInstruction: instructions,
                tools: getGeminiToolsDeclaration()
            }
        };

        LOGGER('info', `Enviando mensagem para o Assistant: `, payload);
        let { response, agentUsed } = await AiService.sendMessage(agent, payload);
        LOGGER('info', `Resposta recebida do Assistant: `, response);

        if (response.functionCalls && response.functionCalls.length > 0) {
            const resultPayload = await handleFunctionCalls(response, payload, firebaseUserId);
            const finalResponse = await AiService.sendMessage(agentUsed, resultPayload);

            return {
                text: finalResponse.response.text,
                agentId: finalResponse.agentUsed.id
            };
        } else {
            return {
                text: response.text,
                agentId: agentUsed.id
            };
        }
    } catch (error) {
        LOGGER('error', 'Erro no serviço de envio da requisição para a IA: ', error);
        throw error;
    }
};

const constructContent = (history, message, media) => {
    let content = [];

    try {
        if (history) {
            content = history.map((msg) => ({
                role: msg.role === 'assistant' ? 'model' : msg.role,
                parts: [{ text: msg.content }]
            }));
        }

        const userMessageParts = [];

        if (message && message.trim() !== '') {
            userMessageParts.push({ text: message });
        }

        if (media && media.data && media.mimeType) {
            userMessageParts.push({
                inlineData: {
                    mimeType: media.mimeType, // 'image/jpeg', 'application/pdf', 'audio/ogg', ...
                    data: media.data // base64
                }
            });
        }

        if (userMessageParts.length === 0) {
            userMessageParts.push({ text: '[Arquivo indisponível ou mensagem vazia]' });
        }

        LOGGER('info', `userMessageParts: `, userMessageParts);

        content.push({
            role: 'user',
            parts: userMessageParts
        });

        return content;
    } catch (error) {
        LOGGER('error', 'Erro ao preparar o conteúdo para a IA: ', error);
        throw error;
    }
};

const handleFunctionCalls = async (response, payload, firebaseUserId) => {
    const functionCall = response.functionCalls[0];
    const { name, args } = functionCall;

    LOGGER('info', `IA solicitou execução da função: ${name}`);
    LOGGER('info', `Argumentos enviados pela IA:`, args);

    let functionResult;

    if (availableTools[name]) {
        functionResult = await availableTools[name].execute(args, firebaseUserId);
    } else {
        functionResult = { status: 'erro', mensagem: 'Função não encontrada.' };
    }

    const secondPayload = {
        model: payload.model,
        contents: [
            ...payload.contents,
            response.candidates[0].content,
            {
                role: 'user',
                parts: [
                    {
                        functionResponse: {
                            name: name,
                            response: functionResult
                        }
                    }
                ]
            }
        ],
        config: payload.config
    };

    return secondPayload;
};

export default { callAgent };
