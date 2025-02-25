import mongoose from 'mongoose';

const messageStatusSchema = new mongoose.Schema({
  message_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Message', 
    required: true 
  },
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  updated_at: { 
    type: Date, 
    default: Date.now 
  }
});

// Thiết lập unique index cho cặp (message_id, user_id) như khóa chính
messageStatusSchema.index({ message_id: 1, user_id: 1 }, { unique: true });

export default mongoose.model('MessageStatus', messageStatusSchema);
