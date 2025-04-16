import jwt from 'jsonwebtoken';

const checkNotAuthenticated = (req, res, next) => {
  const token = req.cookies.token;

  // Nếu không có token, cho qua
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Nếu xác thực thành công thì CHẶN lại
    return res.status(401).json({ message: "Hãy đăng xuất trước khi thực hiện hành động này." });
  } catch (err) {
    console.log("Token không hợp lệ hoặc hết hạn");
    return next(); // Token sai hoặc hết hạn → vẫn cho qua
  }
};

export default checkNotAuthenticated;
