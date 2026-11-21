const fs = require('fs');
const path = require('path');
const multer = require('multer');
const directory = path.join(process.cwd(), 'uploads');
fs.mkdirSync(directory, { recursive: true });
const storage = multer.diskStorage({
  destination: directory,
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`)
});
module.exports = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (_req, file, cb) => {
  if (/^(image\/|application\/pdf|text\/)/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Only images, PDFs, and text files are allowed.'));
} });
