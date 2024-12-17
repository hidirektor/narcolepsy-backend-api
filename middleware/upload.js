const multer = require('multer');
const { extname } = require('path');

// Multer Memory Storage kullanımı
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.zip'];
        const ext = extname(file.originalname).toLowerCase();

        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only .zip files are allowed'), false);
        }
    },
    limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB sınır
});

module.exports = upload;
