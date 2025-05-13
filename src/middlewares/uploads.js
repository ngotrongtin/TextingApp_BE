import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.config.js"; // đường dẫn tùy bạn

// avatar storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "avatars", // tên folder trên Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 300, height: 300, crop: "limit" }],
  },
});

// file storage
const messageFileStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "chat_files";

    let resource_type = "auto"; // mặc định

    if (file.mimetype.startsWith("image/")) {
      folder = "chat_images";
      resource_type = "image";
    } else if (file.mimetype.startsWith("video/")) {
      folder = "chat_videos";
      resource_type = "video";
    } else if (file.mimetype.startsWith("audio/")) {
      folder = "chat_audios";
      resource_type = "video"; // Cloudinary không có "audio", dùng "video" thay thế
    } else if (file.mimetype.startsWith("application/")) {
      folder = "chat_documents";
      resource_type = "raw"; // application/pdf, docx → dùng "raw"
    }

    return {
      folder,
      //allowed_formats,
      resource_type,
    };
  },
});

const handleMessageFile = multer({
  storage: messageFileStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const upload = multer({ storage });

export { handleMessageFile };
export default upload;
