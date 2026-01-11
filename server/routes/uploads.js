const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const { Readable } = require('stream');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload file to GridFS
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    const readable = new Readable();
    readable.push(req.file.buffer);
    readable.push(null);

    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype
    });

    readable.pipe(uploadStream)
      .on('error', (err) => res.status(500).json({ error: err.message }))
      .on('finish', (file) => {
        res.json({ fileId: file._id.toString(), filename: file.filename, contentType: file.contentType });
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve file by GridFS id
router.get('/:id', async (req, res) => {
  try {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    const _id = new mongoose.Types.ObjectId(req.params.id);
    const download = bucket.openDownloadStream(_id);
    download.on('file', (file) => {
      if (file.contentType) res.set('Content-Type', file.contentType);
    });
    download.pipe(res).on('error', () => res.status(404).end());
  } catch (err) {
    res.status(400).json({ error: 'Invalid id' });
  }
});

module.exports = router;