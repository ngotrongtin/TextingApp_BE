import mongoose from 'mongoose';

const friendshipSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  friend_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'blocked'],
    default: 'pending'
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  }
});

// Đảm bảo rằng cặp (user_id, friend_id) là duy nhất (tương đương khóa chính)
friendshipSchema.index({ user_id: 1, friend_id: 1 }, { unique: true });

export default mongoose.model('Friendship', friendshipSchema);
