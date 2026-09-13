import z from 'zod';

const insightSchema = z.object({
    context: z
        .string({
            error: (issue) =>
                issue.input === undefined
                    ? "O parâmetro 'context' é obrigatório."
                    : "O parâmetro 'context' deve ser um texto."
        })
        .trim()
        .max(4000, 'O contexto excedeu o limite máximo de 4000 caracteres.')
});

export default insightSchema;
