import express from 'express';
import groupAdminMiddleware from '../middlewares/groupAdmincheck.js';
import {
  createPrivateGroup,
  createGroupChat,
  removeMemberFromGroup,
  getUserGroups,
  getGroupMembers,
  deleteGroup,
} from '../controllers/groups.controller.js';
const router = express.Router();

// Route tạo nhóm riêng tư
router.post('/create-private-group', createPrivateGroup);
// Route tạo nhóm chat
router.post('/create-group-chat', createGroupChat);
// Route xóa thành viên khỏi nhóm
router.delete('/remove-member', groupAdminMiddleware , removeMemberFromGroup);
// Route lấy danh sách nhóm của người dùng
router.get('/user-groups', getUserGroups);
// Route lấy danh sách thành viên trong nhóm
router.get('/group-members/:groupId', getGroupMembers);
// Route xóa nhóm
router.delete('/delete-group', groupAdminMiddleware, deleteGroup);

export default router;