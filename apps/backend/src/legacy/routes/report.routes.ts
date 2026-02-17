import { Router } from 'express';
import { getProductivityReport, getProjectReport } from '../controllers/report.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware(['admin', 'manager']));

router.get('/productivity', getProductivityReport);
router.get('/projects', getProjectReport);

export default router;
