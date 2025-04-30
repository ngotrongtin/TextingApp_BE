import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    // Lấy token từ cookie hoặc header Authorization
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Bạn chưa đăng nhập" });
    }

    // Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Gắn thông tin người dùng vào req.user
    req.user = decoded;


    next(); // Tiếp tục xử lý request
  } catch (err) {
    res.status(401).json({ message: "Cookie không hợp lệ hoặc hết hạn, hãy đăng nhập" });
  }
};

export default authMiddleware;