import { Router } from 'express';
import {
  createChatroom,
  getAllChatrooms,
  getChatroomById,
  joinChatroom,
  leaveChatroom,
} from '../controllers/chatroomController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/chatrooms
 * @desc    Create a new chatroom
 * @access  Private
 */
router.post('/', createChatroom);

/**
 * @route   GET /api/chatrooms
 * @desc    Get all chatrooms
 * @access  Private
 */
router.get('/', getAllChatrooms);

/**
 * @route   GET /api/chatrooms/:roomId
 * @desc    Get chatroom by ID
 * @access  Private
 */
router.get('/:roomId', getChatroomById);

/**
 * @route   POST /api/chatrooms/:roomId/join
 * @desc    Join a chatroom
 * @access  Private
 */
router.post('/:roomId/join', joinChatroom);

/**
 * @route   POST /api/chatrooms/:roomId/leave
 * @desc    Leave a chatroom
 * @access  Private
 */
router.post('/:roomId/leave', leaveChatroom);

export default router;