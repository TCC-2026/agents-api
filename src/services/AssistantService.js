import LOGGER from '../utils/logger.js';
import AgentRepository from '../repositories/AgentRepository.js';
import AiService from './AiService.js';
import { availableTools, getGeminiToolsDeclaration } from '../tools/index.js';

const callAgent = async (session, history, message, media) => {
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
            prompt + ' \n CONTEXTO ATUAL DO USUÁRIO: \n\n' + session.currentContext || '';
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
            const resultPayload = await handleFunctionCalls(response, payload, session);
            LOGGER('info', `Resposta da função: `, resultPayload);
            const finalResponse = await AiService.sendMessage(agentUsed, resultPayload);
            LOGGER('info', `Resposta final do Assistant após execução da função: `, finalResponse);

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

const handleFunctionCalls = async (response, payload, session) => {
    // const functionCall = response.functionCalls[0];
    try {
        let funcsResponseArray = [];

        for (const funcCall of response.functionCalls) {
            const { name, args } = funcCall;
            let functionResult;

            LOGGER('info', `IA solicitou execução da função: ${name}`);

            if (availableTools[name]) {
                functionResult = await availableTools[name].execute(args, session);
            } else {
                functionResult = { status: 'erro', mensagem: 'Função não encontrada.' };
            }

            let funcResponse = {
                functionResponse: {
                    name: name,
                    response: functionResult
                }
            };

            funcsResponseArray.push(funcResponse);
        }

        const secondPayload = {
            model: payload.model,
            contents: [
                ...payload.contents,
                response.candidates[0].content,
                {
                    role: 'user',
                    parts: funcsResponseArray
                }
            ],
            config: payload.config
        };

        return secondPayload;
    } catch (error) {
        LOGGER('error', 'Erro ao executar a função solicitada pela IA: ', error);
        throw error;
    }
};

export default { callAgent };
