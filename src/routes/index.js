import { Router } from 'express';
import adminAuth from '../middlewares/adminAuthMiddleware.js';
import apiKeyAuth from '../middlewares/apiKeyAuthMiddleware.js';
import twilioAuth from '../middlewares/twilioAuthMiddleware.js';
import ClientController from '../controllers/ClientController.js';
import InsightController from '../controllers/InsightController.js';
import TwilioController from '../controllers/TwilioController.js';
import SessionController from '../controllers/SessionController.js';

const routes = Router();

routes.use('/api/v1/client', adminAuth, ClientController.register);
routes.use('/api/v1/agent/insight', apiKeyAuth, InsightController.generateInsight);
routes.delete('/api/v1/agent/session', apiKeyAuth, SessionController.clearSession);
routes.delete('/api/v1/agent/account', apiKeyAuth, SessionController.deleteAccount);
routes.use('/api/v1/agent/assistant/twilio', twilioAuth, TwilioController.webhook);

export default routes;
