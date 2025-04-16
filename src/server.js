import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import { Server } from 'socket.io';
import initSocket from '../src/socket/index.js';
import http from 'http';

// Lấy giá trị cổng từ môi trường hoặc mặc định là 3000
const PORT = process.env.PORT || 3000;
dotenv.config();

// Kết nối database
connectDB();


// Khởi tạo socket
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

initSocket(io); // 👈 gọi logic socket

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
