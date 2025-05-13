import GroupMember from "../models/group_members.model.js";
const adminCheck = async (req, res, next) => {
  try {
    const groupId = req.params.groupId || req.query.groupId; // Ưu tiên params hoặc query
    const userId = req.user._id;

    if (!groupId) {
      return res.status(400).json({ message: "Thiếu groupId" });
    }

    const adminCheck = await GroupMember.findOne({
      group_id: groupId,
      user_id: userId,
      role: "admin",
    });

    if (!adminCheck) {
      return res.status(403).json({
        message: "Bạn không có quyền thực hiện thao tác này trong nhóm",
      });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export default adminCheck;