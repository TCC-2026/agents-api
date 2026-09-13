import z from 'zod';

const createClientSchema = z.object({
   name: z
      .string({
         error: (issue) =>
            issue.input === undefined
               ? "O parâmetro 'name' é obrigatório."
               : "O parâmetro 'name' deve ser um texto."
      })
      .min(3, 'O nome do cliente deve ter pelo menos 3 caracteres.')
});

export default createClientSchema;
