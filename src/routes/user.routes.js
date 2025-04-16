import {
  loginUser,
  registerUser,
  logoutUser,
  resetPassword,
  updateUser,
  searchUsers,
} from "../controllers/users.controller.js";
import express from "express";
import isSignedIn from "../middlewares/checkNotAuthenticated.js";
import { UserValidation } from "../middlewares/validation.js";
import upload from "../middlewares/uploads.js";
const router = express.Router();
// Đăng ký người dùng mới
router.post("/register", UserValidation, isSignedIn, registerUser);
// Đăng nhập người dùng
router.post("/login", isSignedIn, loginUser);
// Đăng xuất người dùng
router.post("/logout", logoutUser);
// Cập nhật thông tin người dùng
router.put("/update", upload.single("avatar"), updateUser);
// Đặt lại mật khẩu
router.post("/reset-password", resetPassword);
// Tìm kiếm người dùng
router.get("/search", searchUsers);
export default router;
