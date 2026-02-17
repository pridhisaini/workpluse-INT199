import { Router } from 'express';
import {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
} from '../controllers/project.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', roleMiddleware(['admin', 'manager']), createProject);
router.put('/:id', roleMiddleware(['admin', 'manager']), updateProject);
router.delete('/:id', roleMiddleware(['admin']), deleteProject);

export default router;
