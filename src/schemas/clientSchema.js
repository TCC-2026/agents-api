const { z } = require('zod');

const createClientSchema = z.object({
    name: z.string({
        required_error: "O parâmetro 'name' é obrigatório.",
        invalid_type_error: "O parâmetro 'name' deve ser um texto."
    }).min(3, "O nome do cliente deve ter pelo menos 3 caracteres.")
});

module.exports = { createClientSchema };