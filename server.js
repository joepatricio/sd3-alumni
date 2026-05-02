import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
const app = express();
app.use(cors());

// Configure multer to save files to the public directory
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/')
  },
  filename: function (req, file, cb) {
    // Create a unique filename with original extension
    const uniqueSuffix = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext)
  }
});
const upload = multer({ storage: storage });
app.get('/', (req, res) => {
  res.send('Upload server is running! Use POST /upload to upload images.');
});
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // The json-server runs on port 3000 and serves from 'public/'
  // So the image will be available at http://localhost:3000/[filename]
  res.json({ url: `http://localhost:3000/${req.file.filename}` });
});
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Upload server listening on port ${PORT}`);
});