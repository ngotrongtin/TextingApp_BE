import Friendship from "../models/friendships.model.js";

// Gửi lời mời kết bạn
const sendFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user._id;

    const existing = await Friendship.findOne({
      user_id: userId,
      friend_id: friendId,
    });

    if (existing) {
      return res.status(400).json({ message: "Đã gửi lời mời trước đó!" });
    }

    const request = new Friendship({
      user_id: userId,
      friend_id: friendId,
      // Không cần status ở đây vì mặc định là 'pending'
    });

    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Chấp nhận lời mời kết bạn
const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    const request = await Friendship.findById(requestId);
    if (!request || request.status !== "pending") {
      return res
        .status(404)
        .json({ message: "Lời mời không tồn tại hoặc đã xử lý." });
    }

    request.status = "accepted";
    await request.save();

    // Thêm kết bạn ngược lại
    const reverse = new Friendship({
      user_id: request.friend_id,
      friend_id: request.user_id,
      status: "accepted",
    });
    await reverse.save();

    res.json({ message: "Đã chấp nhận lời mời kết bạn." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Hủy hoặc từ chối lời mời
const cancelFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const currentUserId = req.user._id;
    const result = await Friendship.findOneAndDelete({
      _id: requestId,
      $or: [
        { user_id: currentUserId },
        { friend_id: currentUserId }
      ]
    });

    res.json({ message: "Đã hủy lời mời." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Danh sách bạn bè
const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    const friends = await Friendship.find({
      user_id: userId,
      status: "accepted",
    }).populate("friend_id", "name email");

    res.json(friends);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Danh sách lời mời đến
const getIncomingRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await Friendship.find({
      friend_id: userId,
      status: "pending",
    }).populate("user_id", "name email");

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSentRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    // Tìm các lời mời kết bạn đã gửi bởi người dùng
    const sentRequests = await Friendship.find({
      user_id: userId,
      status: "pending",
    }).populate("friend_id", "name email");

    res.json({ message: "Danh sách lời mời đã gửi", sentRequests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export {
  sendFriendRequest,
  acceptFriendRequest,
  cancelFriendRequest,
  getFriends,
  getIncomingRequests,
  getSentRequests,
};
