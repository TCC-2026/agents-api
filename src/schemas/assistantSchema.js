import { z } from 'zod';

const assistantSchema = z.object({
    // Mensagem
    message: z
        .string({
            required_error: 'A mensagem atual (message) é obrigatória.',
            invalid_type_error: 'A mensagem atual deve ser um texto (string).'
        })
        .min(1, 'A mensagem atual não pode estar vazia.'),

    // Histórico da conversa
    history: z
        .array(
            z.object({
                role: z.enum(['user', 'assistant', 'model'], {
                    errorMap: () => ({
                        message:
                            "O campo 'role' no histórico deve ser 'user', 'assistant' ou 'model'."
                    })
                }),
                content: z
                    .string({
                        required_error: 'O conteúdo da mensagem do histórico é obrigatório.',
                        invalid_type_error: 'O conteúdo do histórico deve ser um texto (string).'
                    })
                    .min(1, 'A mensagem do histórico não pode estar vazia.')
            })
        )
        .optional()
        .default([]),

    // Contexto
    context: z.string().optional(),

    // Ferramentas
    tools: z
        .array(
            z.object({
                type: z.literal('function', {
                    errorMap: () => ({
                        message: "O tipo da ferramenta (tool) deve ser exatamente 'function'."
                    })
                }),
                function: z.object({
                    name: z
                        .string({
                            required_error: 'O nome da função é obrigatório na declaração da tool.'
                        })
                        .min(1, 'O nome da função não pode ser vazio.'),
                    description: z
                        .string({
                            required_error:
                                'A descrição da função é obrigatória para a IA entender quando usá-la.'
                        })
                        .min(1, 'A descrição não pode ser vazia.')
                })
            })
        )
        .optional(),

    // Arquivo
    file: z
        .object({
            mimeType: z
                .string({
                    required_error: "O 'mimeType' é obrigatório quando um arquivo é enviado."
                })
                .regex(
                    /^(image\/(jpeg|png|webp|heic)|application\/pdf)$/,
                    'Formato de arquivo não suportado. Envie apenas PDF ou Imagens (JPEG, PNG, WEBP).'
                ),
            base64: z
                .string({
                    required_error: "A string 'base64' é obrigatória quando um arquivo é enviado."
                })
                .min(50, 'A string base64 informada é muito curta para ser um arquivo válido.')
        })
        .optional()
});

export default assistantSchema;
