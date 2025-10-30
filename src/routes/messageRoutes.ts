import { Router } from 'express';
import { getMessages } from '../controllers/messageController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/messages/:roomId
 * @desc    Get messages for a chatroom
 * @access  Private
 * @query   limit - Optional limit for number of messages
 */
router.get('/:roomId', getMessages);

export default router;