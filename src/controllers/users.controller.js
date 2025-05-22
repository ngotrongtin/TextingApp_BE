import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/users.model.js"; 
import FriendShip from "../models/friendships.model.js"; 
// Đăng ký người dùng mới
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser)
      return res
        .status(400)
        .json({ message: "Username hoặc email đã tồn tại." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Đăng nhập người dùng
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Người dùng không tồn tại" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu" });

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", token, {
      httpOnly: false, // 👈 không cho JS truy cập, giúp chống XSS
      secure: false, // true nếu dùng HTTPS
      maxAge: 24 * 60 * 60 * 1000 * 3, // 3 ngày
    });
    res.json({
      token,
      user: {
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Đăng xuất người dùng
const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Đã đăng xuất" });
};

// Reset mật khẩu
const resetPassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ message: "Người dùng không tồn tại" });
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu" });
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.save();
  res.json({ message: "Đặt lại mật khẩu thành công" });
};

// Cập nhật thông tin người dùng
const updateUser = async (req, res) => {
  const { userName, userBio } = req.body;
  const userId = req.user._id; // ID của người dùng hiện tại
  const user = await User.findById(userId);
  if (!user)
    return res.status(404).json({ message: "Người dùng không tồn tại" });
  const avatarUrl = req.file ? req.file.path : user.avatar;// Đường dẫn đến ảnh đã tải lên
  user.username = userName;
  user.bio = userBio;
  user.avatar = avatarUrl; // Cập nhật đường dẫn ảnh đại diện
  await user.save();
  res.json({ message: "Cập nhật thông tin thành công", user });
};

// Tìm kiếm người dùng
const searchUsers = async (req, res) => {
  try {
    const { userName, email } = req.query; // Lấy thông tin tìm kiếm từ query string

    // Tạo điều kiện tìm kiếm động
    const searchCriteria = {};
    if (userName) searchCriteria.username = { $regex: userName, $options: "i" }; // Tìm kiếm không phân biệt hoa thường
    if (email) searchCriteria.email = { $regex: email, $options: "i" };

    // Tìm kiếm người dùng trong cơ sở dữ liệu
    const users = await User.find(searchCriteria);

    // Trả về danh sách người dùng tìm được
    res.status(200).json({ message: "Tìm kiếm thành công", users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getStrangeUsers = async (req, res) => {
  try {
    const userId = req.user._id; // ID của người dùng hiện tại

    // Lấy danh sách bạn bè của người dùng hiện tại (chỉ kiểm tra user_id)
    const friends = await FriendShip.find({
      user_id: userId,
      status: "accepted",
    });

    // Tạo danh sách ID bạn bè
    const friendIds = friends.map((friend) => friend.friend_id);

    // Tìm những người không phải là bạn bè
    const users = await User.find(
      {
        _id: { $nin: [...friendIds, userId] }, // Loại bỏ bạn bè và chính người dùng hiện tại
      },
      { password: 0 }
    ); // Không trả về mật khẩu

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export {
  loginUser,
  registerUser,
  logoutUser,
  resetPassword,
  updateUser,
  searchUsers,
  getStrangeUsers,
};
