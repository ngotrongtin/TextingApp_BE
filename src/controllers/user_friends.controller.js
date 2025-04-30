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
    const { friendId } = req.body;
    const currentUserId = req.user._id;
    const request = await Friendship.findOne({
      user_id: friendId, // Người gửi lời mời
      friend_id: currentUserId, // Người nhận là mình
      status: "pending",
    });

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
    const { friendId } = req.body;
    const currentUserId = req.user._id;

    // Có thể là mình gửi hoặc mình nhận
    const result = await Friendship.findOneAndDelete({
      $or: [
        { user_id: currentUserId, friend_id: friendId },
        { user_id: friendId, friend_id: currentUserId },
      ],
      status: "pending",
    });

    if (!result) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy lời mời để huỷ." });
    }

    res.json({ message: "Đã huỷ lời mời kết bạn." });
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
    }).populate("friend_id", "username email avatar bio");
    // Chỉ lấy thông tin người bạn
    const listfriend = friends.map((item) => item.friend_id);

    res.status(200).json({ listfriend });
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

// Hàm tìm trạng thái kết bạn giữa hai người
const getFriendshipStatus = async (req, res) => {
  const { friendId } = req.body; // Lấy userId và friendId từ body của yêu cầu
  const userId = req.user._id; // ID của người dùng hiện tại
  // Kiểm tra mối quan hệ giữa userId và friendId
  const friendship = await Friendship.findOne({
    $or: [
      { user_id: userId, friend_id: friendId }, // Người gửi kết bạn là userId
      { user_id: friendId, friend_id: userId }, // Người gửi kết bạn là friendId
    ],
  });

  if (!friendship) {
    return res.status(200).json({ status: "Kết bạn" });
  }

  // Kiểm tra trạng thái và trả về thông báo tương ứng
  if (friendship.status === "pending") {
    // Nếu trạng thái là "pending", kiểm tra người gửi kết bạn là ai
    if (friendship.user_id.toString() === userId.toString()) {
      return res.status(200).json({ status: "Huỷ lời mời kết bạn" }); // Người gửi kết bạn là userId
    } else {
      return res.status(200).json({ status: "Chấp nhận lời mời" }); // Người gửi kết bạn là friendId
    }
  }

  if (friendship.status === "accepted") {
    return res.status(200).json({ status: "Bạn bè" }); // Trạng thái là đã chấp nhận kết bạn
  }

  if (friendship.status === "blocked") {
    return res.status(200).json({ status: "Đã bị chặn" }); // Trạng thái bị chặn
  }
};

export {
  sendFriendRequest,
  acceptFriendRequest,
  cancelFriendRequest,
  getFriends,
  getIncomingRequests,
  getSentRequests,
  getFriendshipStatus,
};
