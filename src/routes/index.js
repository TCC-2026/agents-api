import { Router } from 'express';
import clientRoutes from './clientRoutes.js';
import aiRoutes from './agentRoutes.js';
import apiKeyMiddleware from '../middlewares/apiKeyMiddleware.js';
import WhatsappController from '../controllers/WhatsappController.js';

const routes = Router();

routes.use('/api/v1/client', clientRoutes);
routes.use('/api/v1/agent', apiKeyMiddleware, aiRoutes);
routes.use('/api/v1/whatsapp', WhatsappController.whatsappWebHook);

export default routes;
