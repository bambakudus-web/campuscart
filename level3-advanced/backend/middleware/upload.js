const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Images are uploaded straight to Cloudinary instead of the server's local
// disk. This matters for deployment: platforms like Railway wipe the
// filesystem on every redeploy, so anything saved locally would vanish.
// Cloudinary keeps uploaded photos persistent regardless of how many times
// the backend restarts or redeploys.
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'campuscart',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }] // cap size, keep aspect ratio
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = { upload, cloudinary };
