import Group from "../models/group.model.js";
import GroupMember from "../models/group_members.model.js";
import mongoose from "mongoose";
import User from "../models/users.model.js";
import Message from "../models/messages.model.js";
// Tạo nhóm chat riêng tư giữa hai người dùng
// Hàm này sẽ được gọi khi người dùng muốn tạo nhóm chat riêng tư với một người bạn
const createPrivateGroup = async (req, res) => {
  try {
    const { friendId } = req.body; // ID của bạn bè
    const userId = req.user._id;
    // Chuyển sang kiểu objectid trong mongoose
    const objectUserId = mongoose.Types.ObjectId.createFromHexString(userId);
    const objectFriendId =
      mongoose.Types.ObjectId.createFromHexString(friendId);

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
      return res
        .status(200)
        .json({ message: "Nhóm hai người đã tồn tại", group: privateGroup });
    }

    const friend = await User.findById(friendId);

    // Tạo nhóm mới
    const group = new Group({ name: friend._id, type: "private" });
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
    const groupId = req.params.groupId;
    const { memberId } = req.body;
    const userId = req.user._id; // ID của người dùng hiện tại
    const groupMember = await GroupMember.findOne({
      group_id: groupId,
      user_id: userId,
      role: "admin",
    });
    if (!groupMember) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa thành viên khỏi nhóm" });
    }

    if(groupMember.user_id.toString() === memberId) {
      return res
        .status(403)
        .json({ message: "Bạn không thể xóa chính mình khỏi nhóm" });
    }
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
// Hàm này sẽ được gọi khi người dùng muốn xem tất cả danh sách nhóm mà họ tham gia
const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    // Lấy danh sách nhóm người dùng hiện tại tham gia

    const groups = await GroupMember.find({ user_id: userId }).populate(
      "group_id",
      "name type created_at"
    );

    const results = [];

    for (const group of groups) {
      const groupId = group.group_id._id;

      // Lấy tất cả thành viên của nhóm
      const members = await GroupMember.find({ group_id: groupId });

      if (group.group_id.type === "private") {
        // Nếu là nhóm riêng tư, lấy thông tin của bạn bè
        const friendId = members.find(
          (member) => member.user_id.toString() !== userId
        ).user_id;
        const friend = await User.findById(friendId);
        const friendInfo = {
          _id: friend._id,
          username: friend.username,
          avatar: friend.avatar,
        };

        const lastMessage = await Message.findOne({ group_id: groupId })
          .sort({ created_at: -1 })
          .select("content sender_id created_at");

        results.push({
          _id: groupId,
          name: friend.username,
          created_at: group.group_id.created_at,
          type: group.group_id.type,
          active_avatar: friendInfo.avatar,
          last_message: lastMessage || null,
        });
      } else if (group.group_id.type === "group") {
        const lastMessage = await Message.findOne({ group_id: groupId })
          .sort({ created_at: -1 })
          .select("content sender_id created_at");

        results.push({
          _id: groupId,
          name: group.group_id.name,
          created_at: group.group_id.created_at,
          type: group.group_id.type,
          active_avatar: "null",
          last_message: lastMessage || null,
        });
      }
    }

    res.status(200).json({ message: "Danh sách nhóm", groups: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh dách nhóm public
// Hàm này sẽ được gọi khi người dùng muốn xem danh sách nhóm công khai
const getJoinedGroups = async (req, res) => {
  const userId = req.user._id;
  try {
    const memberships = await GroupMember.find({ user_id: userId }).populate({
      path: "group_id",
      match: { type: "group" }, // chỉ lấy nhóm công khai
    });
    const groups = memberships.map((m) => m.group_id).filter((g) => g !== null); // loại bỏ null do không match

    res.status(200).json({ message: "Danh sách nhóm đã tham gia", groups });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách thành viên trong nhóm
// Hàm này sẽ được gọi khi người dùng muốn xem danh sách thành viên trong nhóm
const getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Lấy danh sách thành viên trong nhóm và thông tin người dùng
    const members = await GroupMember.find({ group_id: groupId })
      .populate("user_id", "username email")
      .select("user_id role"); // chọn cả role để trả về loại thành viên

    // Tùy chỉnh lại dữ liệu trả về (gộp thông tin user và role)
    const formattedMembers = members.map(member => ({
      _id: member.user_id._id,
      username: member.user_id.username,
      email: member.user_id.email,
      role: member.role,
    }));

    res.status(200).json({ message: "Danh sách thành viên", groupId: groupId ,members: formattedMembers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Xóa nhóm
// Hàm này sẽ được gọi khi người dùng muốn xóa nhóm
const deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;

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
  getJoinedGroups,
};
