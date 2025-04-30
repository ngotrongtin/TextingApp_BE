// /src/socket/index.js
import { socketHandler } from "../controllers/messaging.controller.js";

export default function initSocket(io) {
  io.on('connection', (socket) => {
    console.log("Socket connected:", socket.id);

    socketHandler(socket, io); // gọi controller xử lý socket

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
}
