import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  group_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Group', 
    required: true 
  },
  sender_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    type: String, 
    default: null  // Nội dung tin nhắn có thể để null nếu chỉ gửi file
  },
  message_type: {
    type: String,
    enum: ['text', 'image', 'video', 'file'],
    default: 'text'
  },
  attachment_url: { 
    type: String, 
    default: null  // Đường dẫn đến file đính kèm nếu có
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model('Message', messageSchema);
