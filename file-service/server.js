const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const fileName = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
            cb(null, fileName);
        }
    })
});

app.post('/api/files/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Please upload a file' });
    }

    res.status(201).json({
        message: 'File uploaded successfully to AWS S3!',
        file: {
            originalName: req.file.originalname,
            storageName: req.file.key,
            size: req.file.size,
            url: req.file.location
        }
    });
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
    console.log(`☁️ File Service is running on port ${PORT} and connected to AWS S3`);
});