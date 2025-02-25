import mongoose from 'mongoose';

const conversationMemberSchema = new mongoose.Schema({
  conversation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  joined_at: { type: Date, default: Date.now }
});

// Thiết lập unique index cho cặp (conversation_id, user_id) như khóa chính
conversationMemberSchema.index({ conversation_id: 1, user_id: 1 }, { unique: true });

export default mongoose.model('ConversationMember', conversationMemberSchema);
