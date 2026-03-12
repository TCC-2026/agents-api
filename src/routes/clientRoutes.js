import { Router } from 'express';
import ClientController from '../controllers/ClientController.js';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';

const clientRoutes = Router();

clientRoutes.post('/', adminAuthMiddleware, ClientController.register);

export default clientRoutes;
