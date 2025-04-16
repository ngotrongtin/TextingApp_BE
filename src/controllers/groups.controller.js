import Group from "../models/group.model.js";
import GroupMember from "../models/group_members.model.js";
import mongoose from "mongoose";
// Tạo nhóm chat riêng tư giữa hai người dùng
// Hàm này sẽ được gọi khi người dùng muốn tạo nhóm chat riêng tư với một người bạn
const createPrivateGroup = async (req, res) => {
  try {
    const { friendId } = req.body; // ID của bạn bè
    const userId = req.user._id;
    // Chuyển sang kiểu objectid trong mongoose
    const objectUserId = mongoose.Types.ObjectId.createFromHexString(userId);
    const objectFriendId = mongoose.Types.ObjectId.createFromHexString(friendId);

    // Kiểm tra xem nhóm hai người đã tồn tại chưa
    const privateGroup = await Group.findOne({
      type: "private",
      _id: {
        $in: await GroupMember.aggregate([
          { $match: { user_id: { $in: [objectUserId, objectFriendId] } } },
          {
            $group: {
              _id: "$group_id",
              count: { $sum: 1 },
            },
          },
          { $match: { count: 2 } }, // chỉ những conversation có cả 2 user
          { $project: { _id: 1 } },
        ]).then((res) => res.map((r) => r._id)),
      },
    });
    
    if (privateGroup) {
      return res.status(200).json({ message: "Nhóm hai người đã tồn tại", group: privateGroup });
    }
    
    // Tạo nhóm mới
    const group = new Group({ name: null, type: "private" });
    await group.save();

    // Thêm người dùng hiện tại vào nhóm
    const userMember = new GroupMember({
      group_id: group._id,
      user_id: userId,
      role: "member",
    });
    await userMember.save();

    // Thêm bạn bè vào nhóm
    const friendMember = new GroupMember({
      group_id: group._id,
      user_id: friendId,
      role: "member",
    });
    await friendMember.save();

    res.status(201).json({ message: "Tạo nhóm hai người thành công", group });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tạo nhóm chat nhiều người dùng
// Hàm này sẽ được gọi khi người dùng muốn tạo nhóm chat với nhiều người bạn
const createGroupChat = async (req, res) => {
  try {
    const { name, memberIds } = req.body; // Tên nhóm và danh sách thành viên
    const userId = req.user._id;

    // Tạo nhóm mới
    const group = new Group({ name, type: "group" });
    await group.save();

    // Thêm người tạo nhóm vào danh sách thành viên với vai trò admin
    const adminMember = new GroupMember({
      group_id: group._id,
      user_id: userId,
      role: "admin",
    });
    await adminMember.save();

    // Thêm các thành viên khác vào nhóm
    const memberPromises = memberIds.map((memberId) =>
      new GroupMember({
        group_id: group._id,
        user_id: memberId,
        role: "member",
      }).save()
    );
    await Promise.all(memberPromises);

    res.status(201).json({ message: "Tạo nhóm nhiều người thành công", group });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xoá thành viên khỏi nhóm
// Hàm này sẽ được gọi khi người dùng muốn xóa một thành viên khỏi nhóm
const removeMemberFromGroup = async (req, res) => {
  try {
    const { groupId, memberId } = req.body;
    const userId = req.user._id; // ID của người dùng hiện tại
    // Xóa thành viên khỏi nhóm
    const result = await GroupMember.findOneAndDelete({
      group_id: groupId,
      user_id: memberId,
    });
    if (!result) {
      return res
        .status(404)
        .json({ message: "Thành viên không tồn tại trong nhóm" });
    }

    res.status(200).json({ message: "Xóa thành viên thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách nhom mà người dùng tham gia
// Hàm này sẽ được gọi khi người dùng muốn xem danh sách nhóm mà họ tham gia
const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    // Lấy danh sách nhóm mà người dùng tham gia
    const groups = await GroupMember.find({ user_id: userId }).populate(
      "group_id",
      "name type created_at"
    );

    res.status(200).json({ message: "Danh sách nhóm", groups });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách thành viên trong nhóm
// Hàm này sẽ được gọi khi người dùng muốn xem danh sách thành viên trong nhóm
const getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Lấy danh sách thành viên trong nhóm
    const members = await GroupMember.find({ group_id: groupId }).populate(
      "user_id",
      "username email"
    );

    res.status(200).json({ message: "Danh sách thành viên", members });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa nhóm
// Hàm này sẽ được gọi khi người dùng muốn xóa nhóm
const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.body;

    // Xóa nhóm
    await Group.findByIdAndDelete(groupId);

    // Xóa tất cả thành viên trong nhóm
    await GroupMember.deleteMany({ group_id: groupId });

    res.status(200).json({ message: "Xóa nhóm thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export {
  createPrivateGroup,
  createGroupChat,
  removeMemberFromGroup,
  getUserGroups,
  getGroupMembers,
  deleteGroup,
};