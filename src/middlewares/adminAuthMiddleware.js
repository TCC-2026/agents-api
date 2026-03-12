import LOGGER from '../utils/logger.js';

const adminAuthMiddleware = (req, res, next) => {
   try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
         return res
            .status(401)
            .json({ error: 'Token de autenticação não fornecido ou mal formatado.' });
      }

      const token = authHeader.split(' ')[1];

      if (token !== process.env.ADMIN_PASS) {
         return res.status(401).json({ error: 'Credenciais inválidas.' });
      }

      next();
   } catch (error) {
      LOGGER('error', 'Error in adminAuthMiddleware:', error);
      return res
         .status(500)
         .json({ error: 'Erro interno na autenticação da requisição.', message: error.message });
   }
};

export default adminAuthMiddleware;
