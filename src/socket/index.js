// /src/socket/index.js
import { messagingSocketHandler } from "../controllers/messaging.controller.js";
import onlineUsers from "../utils/onlineUsers.js";
export default function initSocket(io) {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("user-onlines", (userId) => {
      onlineUsers.set(userId, socket.id); // lưu socketId của user
      console.log("User online:", userId);
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });

    messagingSocketHandler(socket, io); // gọi controller xử lý socket

    socket.on("disconnect", () => {
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit("online-users", Array.from(onlineUsers.keys()));
      console.log("Socket disconnected:", socket.id);
    });
  });
}
