import express from 'express';
import { getMessagesByGroup, uploadMessageFile } from '../controllers/messaging.controller.js';
import { handleMessageFile } from '../middlewares/uploads.js';
const router = express.Router();

// route trả về tin nhắn theo groupId
router.get('/:groupId',getMessagesByGroup);
router.post('/upload',handleMessageFile.single("file") ,uploadMessageFile);

export default router;