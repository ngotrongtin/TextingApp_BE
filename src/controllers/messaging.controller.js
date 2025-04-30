// /src/socket/index.js
import Message from "../models/messages.model.js";
import MessageStatus from "../models/message_status.model.js";
import GroupMember from "../models/group_members.model.js";
export const socketHandler = (socket, io) => {
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
    const {
      group_id,
      sender_id,
      content,
      message_type,
      attachment_url,
    } = data;

    try {
      // 1. Tạo tin nhắn
      const message = await Message.create({
        group_id,
        sender_id,
        content,
        message_type,
        attachment_url,
      });

      // 2. Lấy tất cả thành viên trong cuộc trò chuyện
      const members = await GroupMember.find({ group_id });

      // 3. Tạo MessageStatus cho từng người nhận 
      const statusEntries = members
        .map((member) => ({
          message_id: message._id,
          user_id: member.user_id,
          status: member.user_id.toString() === sender_id ? 'sent' : 'delivered',
        }));

      // 4. Lưu tất cả messageStatus
      await MessageStatus.insertMany(statusEntries);

      // 5. Gửi tin nhắn đến tất cả các socket trong room
      io.to(group_id).emit("newMessage", message);
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
      .populate('sender_id', 'name avatar') // populate nếu bạn muốn hiện thêm thông tin người gửi
      .sort({ created_at: 1 }); // sort theo thời gian tăng dần

    res.status(200).json({ messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Lỗi server khi lấy tin nhắn" });
  }
};

export { getMessagesByGroup };
