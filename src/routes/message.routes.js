import express from 'express';
import { getMessagesByGroup, uploadMessageFile, unreadMessage, markMessagesAsRead } from '../controllers/messaging.controller.js';
import { handleMessageFile } from '../middlewares/uploads.js';
const router = express.Router();

router.get('/unread-messages', unreadMessage);
router.get('/:groupId',getMessagesByGroup);
router.post('/upload',handleMessageFile.single("file") ,uploadMessageFile);
router.put('/mark-as-read/:groupId', markMessagesAsRead);
export default router;