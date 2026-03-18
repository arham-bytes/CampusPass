const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

let upload;

if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
) {
    // Cloudinary configuration
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const storage = new CloudinaryStorage({
        cloudinary,
        params: {
            folder: 'campuspass',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            transformation: [{ width: 1200, height: 630, crop: 'limit' }],
        },
    });

    upload = multer({ storage });
} else {
    // Fallback: local file storage
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadDir),
        filename: (req, file, cb) => {
            const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
            cb(null, uniqueName);
        },
    });

    upload = multer({
        storage,
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
        fileFilter: (req, file, cb) => {
            const allowed = /jpeg|jpg|png|webp/;
            const ext = allowed.test(path.extname(file.originalname).toLowerCase());
            const mime = allowed.test(file.mimetype);
            if (ext && mime) return cb(null, true);
            cb(new Error('Only image files (jpg, png, webp) are allowed'));
        },
    });
}

module.exports = { cloudinary, upload };
