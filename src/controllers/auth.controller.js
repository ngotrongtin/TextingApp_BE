// controllers/userController.js
import User from "../models/users.model.js";

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

export default getCurrentUser;