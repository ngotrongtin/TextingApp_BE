import {
  loginUser,
  registerUser,
  logoutUser,
  resetPassword,
  updateUser,
  searchUsers,
  getStrangeUsers,
} from "../controllers/users.controller.js";
import express from "express";
import checkNotAuthenticated from "../middlewares/checkNotAuthenticated.js";
import { UserValidation } from "../middlewares/validation.js";
import upload from "../middlewares/uploads.js";
import authMiddleware from "../middlewares/auth.js";
const router = express.Router();
// Đăng ký người dùng mới
router.post("/register", UserValidation, checkNotAuthenticated, registerUser);
// Đăng nhập người dùng
router.post("/login", checkNotAuthenticated, loginUser);
// Đăng xuất người dùng
router.post("/logout", logoutUser);
// Cập nhật thông tin người dùng
router.put("/update", authMiddleware, upload.single("avatar"), updateUser);
// Đặt lại mật khẩu
router.post("/reset-password", resetPassword);
// Tìm kiếm người dùng
router.get("/search", searchUsers);
// Lấy danh sách tất cả người dùng
router.get("/strangers",authMiddleware ,getStrangeUsers);
export default router;
