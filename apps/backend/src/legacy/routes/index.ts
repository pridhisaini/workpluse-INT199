import { Router } from 'express';
import authRoutes from './auth.routes';
import projectRoutes from './project.routes';
import sessionRoutes from './session.routes';
import reportRoutes from './report.routes';
import activityRoutes from './activity.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/sessions', sessionRoutes);
router.use('/reports', reportRoutes);
router.use('/activities', activityRoutes);
router.use('/users', userRoutes);

export default router;
