import Message from '../models/messages.model.js';

export const socketHandler = (socket, io) => {
  // Join room
  socket.on('joinRoom', (conversationId) => {
    socket.join(conversationId);
    console.log(`${socket.id} joined room ${conversationId}`);
  });

  // Gửi tin nhắn
  socket.on('sendMessage', async (data) => {
    const { conversation_id, sender_id, content, message_type, attachment_url } = data;

    const message = await Message.create({
      conversation_id,
      sender_id,
      content,
      message_type,
      attachment_url,
    });

    io.to(conversation_id).emit('newMessage', message); // gửi tin nhắn đến tất cả client trong room
  });
};
