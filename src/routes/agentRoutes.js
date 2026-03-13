import { Router } from 'express';
import InsightController from '../controllers/InsightController.js';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';

const aiRoutes = Router();

aiRoutes.post('/assistant', adminAuthMiddleware, InsightController.generate);
aiRoutes.post('/goal', adminAuthMiddleware, InsightController.generate);
aiRoutes.post('/insight', InsightController.generate);
aiRoutes.post('/import', adminAuthMiddleware, InsightController.generate);
aiRoutes.post('/categorization', adminAuthMiddleware, InsightController.generate);

export default aiRoutes;
