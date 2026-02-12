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
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype
    });
    uploadStream.end(req.file.buffer);
    uploadStream.on('finish', (file) => {
      res.json({ fileId: file._id.toString(), filename: file.filename, contentType: file.contentType });
    });
    uploadStream.on('error', (err) => res.status(500).json({ error: err.message }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve file by filename
router.get('/file/:filename', async (req, res) => {
  try {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    const files = await bucket.find({ filename: req.params.filename }).toArray();
    if (!files.length) return res.status(404).json({ error: 'File not found' });
    const file = files[0];
    const download = bucket.openDownloadStream(file._id);
    if (file.contentType) res.set('Content-Type', file.contentType);
    download.pipe(res).on('error', () => res.status(404).end());
  } catch (err) {
    res.status(400).json({ error: 'Invalid filename' });
  }
});

// Serve file by fileId (more reliable when filenames contain special chars)
router.get('/id/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    const _id = new mongoose.Types.ObjectId(id);
    const files = await bucket.find({ _id }).toArray();
    if (!files.length) return res.status(404).json({ error: 'File not found' });
    const file = files[0];
    const download = bucket.openDownloadStream(file._id);
    if (file.contentType) res.set('Content-Type', file.contentType);
    // suggest filename for download
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename.replace(/[^\w\-. ]/g, '')}"`);
    download.pipe(res).on('error', () => res.status(404).end());
  } catch (err) {
    res.status(400).json({ error: 'Invalid id' });
  }
});

module.exports = router;