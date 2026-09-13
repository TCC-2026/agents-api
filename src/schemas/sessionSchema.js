import z from 'zod';

const phoneSchema = z.object({
   phone: z
      .string({
         error: (issue) =>
            issue.input === undefined
               ? "O parâmetro 'phone' é obrigatório."
               : "O parâmetro 'phone' deve ser um texto."
      })
      .min(10, 'O telefone deve ter pelo menos 10 dígitos.')
});

export default phoneSchema;
