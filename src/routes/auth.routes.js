import express from 'express';
import authMiddleware from '../middlewares/auth.js';
import getCurrentUser from '../controllers/auth.controller.js';

const router = express.Router();

// Route lấy thông tin người dùng hiện tại
router.get('/me', authMiddleware, getCurrentUser);

export default router;