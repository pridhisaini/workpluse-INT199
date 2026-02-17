import { Router } from 'express';
import {
    getSessions,
    getCurrentSession,
    startSession,
    stopSession,
    updateSession
} from '../controllers/session.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getSessions);
router.get('/current', getCurrentSession);
router.post('/start', startSession);
router.post('/stop', stopSession);
router.put('/:id', updateSession);

export default router;
