import express from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  cancelFriendRequest,
  getFriends,
  getIncomingRequests,
  getSentRequests,
  getFriendshipStatus,
} from "../controllers/user_friends.controller.js";
const router = express.Router();

// Gửi lời mời kết bạn
router.post("/add_friend", sendFriendRequest);
// Chấp nhận lời mời kết bạn
router.post("/accept", acceptFriendRequest);
// Từ chối lời mời kết bạn
router.post("/reject", cancelFriendRequest);
// Lấy danh sách bạn bè
router.get("/list", getFriends);
// Lấy danh sách lời mời đến
router.get("/incoming_requests", getIncomingRequests);
// Lấy danh sách lời mời đã gửi
router.get("/sent_requests", getSentRequests);
// Lấy trạng thái kết bạn giữa hai người
router.post("/status", getFriendshipStatus);
export default router;
