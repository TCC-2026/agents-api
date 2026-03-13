import { Router } from 'express';
import clientRoutes from './clientRoutes.js';
import aiRoutes from './agentRoutes.js';
import apiKeyMiddleware from '../middlewares/apiKeyMiddleware.js';

const routes = Router();

routes.use('/api/v1/client', clientRoutes);
routes.use('/api/v1/agent', apiKeyMiddleware, aiRoutes);

export default routes;
