import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
// Lấy giá trị cổng từ môi trường hoặc mặc định là 3000
const PORT = process.env.PORT || 3000;
dotenv.config();

// Kết nối database
connectDB();

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
