const { prisma } = require('../utils/prisma.js');
const crypto = require('crypto');

const register = async (req, res) => {

    try {
        const { name } = req.body;

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "Token de autenticação não fornecido ou mal formatado." });
        }

        const token = authHeader.split(' ')[1];

        if (token !== process.env.ADMIN_PASS) {
            return res.status(401).json({ error: "Credenciais inválidas." });
        }

        if (!name) {
            return res.status(400).json({ error: "O parâmetro 'name' é obrigatório." });
        }

        const apiKey = crypto.randomBytes(32).toString('hex');

        const newClient = await prisma.client.create({
            data: {
                name: name,
                apiKey: apiKey
            }
        });

        return res.status(201).json({
            message: "Cliente registrado com sucesso.", 
            token: newClient.apiKey
        });

    } catch (error) {
        console.error("Error registering client:", error);
        
        
        // O Prisma tem códigos de erro. P2002 significa que feriu uma regra "@unique"
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Já existe um cliente cadastrado com este nome.', message: error.message });
        }

        return res.status(500).json({ error: "Erro interno do servidor.", message: error.message });
    }
    

};

module.exports = { register };