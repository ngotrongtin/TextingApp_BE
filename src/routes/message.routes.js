import express from 'express';
import { getMessagesByGroup } from '../controllers/messaging.controller.js';

const router = express.Router();

// route trả về tin nhắn theo groupId
router.get('/:groupId', getMessagesByGroup);

export default router;