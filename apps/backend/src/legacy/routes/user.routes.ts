import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/user.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

// All user routes require admin role
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
