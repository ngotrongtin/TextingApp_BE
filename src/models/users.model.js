import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    maxlength: 100 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    maxlength: 150 
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 6 
  }, // Mật khẩu đã hash
  avatar: { 
    type: String, 
    default: null 
  }, // Ảnh đại diện (URL)
  bio: { 
    type: String, 
    default: null 
  }, // Giới thiệu cá nhân
  created_at: { 
    type: Date, 
    default: Date.now 
  },
  updated_at: { 
    type: Date, 
    default: Date.now 
  }
});

// Middleware cập nhật `updated_at` khi có thay đổi
userSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

export default mongoose.model('User', userSchema);

