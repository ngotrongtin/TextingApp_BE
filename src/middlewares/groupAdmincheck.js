import GroupMember from "../models/group_members.model.js";
const adminCheck = async (req, res, next) => {
  try {
    const { groupId } = req.body;
    const userId = req.user._id;

    // Kiểm tra xem người dùng hiện tại có phải admin của nhóm không
    const adminCheck = await GroupMember.findOne({
      group_id: groupId,
      user_id: userId,
      role: "admin",
    });

    if (!adminCheck) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa thành viên trong nhóm này" });
    }

    next(); // Tiếp tục xử lý request
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default adminCheck;