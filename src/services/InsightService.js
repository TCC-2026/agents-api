import LOGGER from '../utils/logger.js';
import ai from '../config/gemini.js';

const generate = async (context) => {
    try {
        const hoje = new Date().toLocaleDateString('pt-BR');
        const systemInstruction = `
        Você é o motor de notificações push de um app financeiro voltado para educação financeira. Hoje é dia ${hoje}.
        Seu objetivo é gerar UM ÚNICO ALERTA baseado no contexto do usuário.
        O conteúdo do alerta deve ser:
        1. Curiosidades educacionais sobre finanças.
        2. Dicas práticas para melhorar a saúde financeira.
        4. Riscos de inadimplência, se o contexto indicar que o usuário pode estar próximo disso.
        5. Dicas de economia, se o contexto indicar que o usuário tem gastos elevados em alguma categoria.
        6. Notícias bombasticas de hoje que afetam a econômia brasileira ou mundial.

        REGRAS DE OURO (ESTRITAMENTE OBRIGATÓRIAS):
        1. RETORNE APENAS UMA ÚNICA FRASE CURTA.
        2. NÃO escreva saudações (ex: "Olá", "Aqui está", "Fiquei de olho").
        3. NÃO use bullet points, asteriscos ou quebras de linha.
        4. MÁXIMO DE 12 PALAVRAS.
        5. Seja direto e com tom de manchete de jornal.

        FORA DO ESCOPO: Investimentos, criptomoedas, ações, renda variável, análises de mercado, dicas de apps financeiros, dicas de bancos, dicas de cartões de crédito, dicas de empréstimos, dicas de financiamentos, dicas de seguros, dicas de previdência privada.
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: systemInstruction + ' Contexto do usuário: ' + context,
            //history: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                temperature: 0.7
            }
        });
        LOGGER('info', 'Insight generated successfully:', response.text);
        return response.text;
    } catch (error) {
        LOGGER('error', 'Error in service generating insight:', error);
        throw error;
    }
};

export default { generate };
