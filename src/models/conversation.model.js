import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['private', 'group'],  // private: chat 1-1, group: nhóm chat
    default: 'private'
  },
  name: { 
    type: String, 
    default: null,
    maxlength: 100  // giới hạn tối đa 100 ký tự
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model('Conversation', conversationSchema);
