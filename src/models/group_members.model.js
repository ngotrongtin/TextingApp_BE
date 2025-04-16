import mongoose from 'mongoose';

const groupMemberSchema = new mongoose.Schema({
  group_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Group', 
    required: true 
  },
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['member', 'admin'], 
    default: 'member' 
  }, // Thêm role với mặc định là member
  joined_at: { 
    type: Date, 
    default: Date.now 
  }
});

// Thiết lập unique index cho cặp (group_id, user_id) như khóa chính
groupMemberSchema.index({ group_id: 1, user_id: 1 }, { unique: true });

export default mongoose.model('GroupMember', groupMemberSchema);
