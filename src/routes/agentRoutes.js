import { Router } from 'express';
import InsightController from '../controllers/InsightController.js';
import AssistantController from '../controllers/AssistantController.js';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';

const aiRoutes = Router();

aiRoutes.post('/assistant', AssistantController.conversation);
aiRoutes.post('/goal', adminAuthMiddleware, InsightController.generateInsight);
aiRoutes.post('/insight', InsightController.generateInsight);
aiRoutes.post('/import', adminAuthMiddleware, InsightController.generateInsight);
aiRoutes.post('/categorization', adminAuthMiddleware, InsightController.generateInsight);

export default aiRoutes;
