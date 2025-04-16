export const UserValidation = (req, res, next) => {
    const { username, email, password } = req.body;
    const errors = [];
    
    // Kiểm tra username
    if (!username || username.length < 3) {
        errors.push("Username phải có ít nhất 3 ký tự.");
    }

    // Kiểm tra email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        errors.push("Email không hợp lệ.");
    }

    // Kiểm tra password
    if (!password || password.length < 6) {
        errors.push("Password phải có ít nhất 6 ký tự.");
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    next();
}
