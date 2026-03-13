import z from 'zod';

const insightSchema = z.object({
    context: z
        .string({
            required_error: "O parâmetro 'context' é obrigatório.",
            invalid_type_error: "O parâmetro 'context' deve ser um texto."
        })
        .trim()
        .max(3000, 'O contexto excedeu o limite máximo de 3000 caracteres.')
});

export default insightSchema;
