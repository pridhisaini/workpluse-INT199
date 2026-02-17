import { Router } from 'express';
import { getActivityLogs, getEmployeeActivityLogs } from '../controllers/activity.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', roleMiddleware(['admin', 'manager']), getActivityLogs);
router.get('/employee/:userId', roleMiddleware(['admin', 'manager']), getEmployeeActivityLogs);

export default router;
