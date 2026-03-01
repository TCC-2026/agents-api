const { createClient } = require('../services/ClientService');

const register = async (req, res) => {

    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: "O parâmetro 'name' é obrigatório." });
        }

        const newClient = await createClient(name);

        return res.status(201).json({
            message: "Cliente registrado com sucesso.", 
            token: newClient.apiKey
        });

    } catch (error) {
        console.error("Error registering client:", error);
        
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Já existe um cliente cadastrado com este nome.', message: error.message });
        }

        return res.status(500).json({ error: "Erro interno do servidor.", message: error.message });
    }

};

module.exports = { register };