import { Router } from 'express';
import clientRoutes from './clientRoutes.js';

const routes = Router();

routes.use('/api/v1/client', clientRoutes);

routes.post('/api/v1/assistant', clientRoutes);
routes.post('/api/v1/goal', clientRoutes);
routes.post('/api/v1/insight', clientRoutes);
routes.post('/api/v1/import', clientRoutes);
routes.post('/api/v1/categorization', clientRoutes);

export default routes;
