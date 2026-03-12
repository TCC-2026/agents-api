import createClient from '../services/ClientService.js';
import createClientSchema from '../schemas/clientSchema.js';
import LOGGER from '../utils/logger.js';

const register = async (req, res) => {
   try {
      const validation = createClientSchema.safeParse(req.body);

      if (!validation.success) {
         const errorMessage = validation.error.issues[0].message;
         return res.status(400).json({ error: errorMessage });
      }

      const { name } = validation.data;

      if (!name) {
         return res.status(400).json({ error: "O parâmetro 'name' é obrigatório." });
      }

      const newClient = await createClient(name);

      return res.status(201).json({
         message: 'Cliente registrado com sucesso.',
         token: newClient.apiKey
      });
   } catch (error) {
      LOGGER('error', 'Error registering client:', error);

      if (error.code === 'P2002') {
         return res.status(409).json({
            error: 'Já existe um cliente cadastrado com este nome.',
            message: error.message
         });
      }

      return res.status(500).json({ error: 'Erro interno do servidor.', message: error.message });
   }
};

export default { register };
