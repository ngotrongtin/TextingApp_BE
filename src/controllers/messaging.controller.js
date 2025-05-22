import Message from "../models/messages.model.js";
import MessageStatus from "../models/message_status.model.js";
import GroupMember from "../models/group_members.model.js";
import onlineUsers from "../utils/onlineUsers.js";
export const messagingSocketHandler = (socket, io) => {
  // Join room
  socket.on("joinRoom", (groupId) => {
    socket.join(groupId);
    console.log(`${socket.id} joined room ${groupId}`);
  });

  // Leave room
  socket.on("leaveRoom", (groupId) => {
    socket.leave(groupId);
    console.log(`${socket.id} left room ${groupId}`);
  });

  // Gửi tin nhắn
  socket.on("sendMessage", async (data) => {
    const { group_id, sender_id, content, message_type, attachment_url } = data;
    console.log("Nhận tin nhắn từ client:", data.content);
    try {
      // Tạo tin nhắn
      const message = await Message.create({
        group_id,
        sender_id,
        content,
        message_type,
        attachment_url,
      });
      const members = await GroupMember.find({ group_id });
      const socketsInRoom = await io.in(group_id).fetchSockets();
      const onlineUserIdsInRoom = socketsInRoom
        .map((s) => {
          for (let [userId, socketId] of onlineUsers.entries()) {
            if (socketId === s.id) return userId;
          }
          return null;
        })
        .filter(Boolean); // lọc null
      // Tạo MessageStatus cho từng người nhận
      const statusEntries = members.map((member) => ({
        message_id: message._id,
        user_id: member.user_id,
        status: onlineUserIdsInRoom.includes(member.user_id.toString())
          ? "read"
          : "delivered",
      }));

      // Lưu tất cả messageStatus
      await MessageStatus.insertMany(statusEntries);

      // Lấy lại message kèm thông tin người gửi (populate)
      const fullMessage = await Message.findById(message._id).populate({
        path: "sender_id",
        select: "username avatar", // chỉ lấy tên và avatar
      });

      const sender_name = fullMessage.sender_id.username;
      const notification = sender_name + " đã gửi tin nhắn mới";
      // 5. Gửi tin nhắn đến tất cả các socket trong room
      io.to(group_id).emit("newMessage", fullMessage);
      // 6. Gửi thông báo đến tất cả các thành viên trong nhóm
      members.forEach((member) => {
        const userId = member.user_id.toString();
        const socketId = onlineUsers.get(userId);

        // Không gửi cho chính người gửi
        if (socketId && userId !== sender_id) {
          io.to(socketId).emit("newMessageNotification", {
            groupId: group_id,
            notification,
          });
        }
      });
    } catch (err) {
      console.error("Lỗi gửi tin nhắn:", err.message);
      socket.emit("error", { message: "Gửi tin nhắn thất bại." });
    }
  });
};

const getMessagesByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!groupId) {
      return res.status(400).json({ message: "Thiếu groupId" });
    }

    const messages = await Message.find({ group_id: groupId })
      .populate("sender_id", "username avatar") // populate để thêm thông tin người gửi
      .sort({ created_at: 1 }); // sort theo thời gian tăng dần

    res.status(200).json({ messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Lỗi server khi lấy tin nhắn" });
  }
};

const uploadMessageFile = async (req, res) => {
  try {
    const { file } = req;
    if (!file) {
      return res
        .status(400)
        .json({ message: "Không có file nào được tải lên" });
    }

    // Trả về URL của file đã tải lên
    res.status(200).json({ fileUrl: file.path });
  } catch (err) {
    console.log("Error uploading file:", err);
    res.status(500).json({ message: "Lỗi server khi tải lên file" });
  }
};

const unreadMessage = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Lấy tất cả message_id mà user chưa đọc
    const unreadStatuses = await MessageStatus.find({
      user_id: userId,
      status: { $ne: "read" },
    }).select("message_id");

    const messageIds = unreadStatuses.map((status) => status.message_id);

    // 2. Truy ngược lại group_id từ Message
    const groupIds = await Message.distinct("group_id", {
      _id: { $in: messageIds },
    });

    res.status(200).json({
      count: groupIds.length,
      groups: groupIds,
    });
  } catch (err) {
    console.error("Error counting unread message groups:", err);
    res
      .status(500)
      .json({ message: "Lỗi server khi đếm nhóm có tin nhắn chưa đọc" });
  }
};

const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const groupId = req.params.groupId;

    // 1. Lấy tất cả message_id trong group
    const messages = await Message.find({ group_id: groupId }).select("_id");

    const messageIds = messages.map((msg) => msg._id);

    if (messageIds.length === 0) {
      return res
        .status(200)
        .json({ message: "Không có tin nhắn nào để cập nhật" });
    }

    // 2. Cập nhật tất cả các message_status của user trong group thành "read"
    const result = await MessageStatus.updateMany(
      {
        user_id: userId,
        message_id: { $in: messageIds },
        status: { $ne: "read" },
      },
      { $set: { status: "read" } }
    );

    res.status(200).json({
      message: "Đã đánh dấu tất cả tin nhắn là đã đọc",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("Lỗi khi đánh dấu tin nhắn là đã đọc:", err);
    res.status(500).json({ message: "Lỗi server khi cập nhật trạng thái đọc" });
  }
};

export {
  getMessagesByGroup,
  uploadMessageFile,
  unreadMessage,
  markMessagesAsRead,
};
