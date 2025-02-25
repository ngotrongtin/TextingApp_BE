import express from 'express';
import { sendMessage } from '../controllers/message.controller.js';

const router = express.Router();

// Route gửi tin nhắn
router.post('/', sendMessage);

export default router;