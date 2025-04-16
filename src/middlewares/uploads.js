import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.config.js'; // đường dẫn tùy bạn

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'avatars',       // tên folder trên Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 300, height: 300, crop: 'limit' }],
  },
});

const upload = multer({ storage });

export default upload;
