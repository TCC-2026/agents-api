import express from 'express';
import HelloController from '../controllers/HelloController.js';
import ClientController from '../controllers/ClientController.js';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';

const routes = express.Router();
routes.get('/api/ola', HelloController.sayHello);
routes.post('/api/client', adminAuthMiddleware, ClientController.register);

export default routes;