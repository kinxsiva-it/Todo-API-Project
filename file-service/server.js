const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true                
}));
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
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: function (req, file, cb) {
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        
        const ext = path.extname(file.originalname).toLowerCase();
        
        if (!allowedExtensions.includes(ext) || !allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type! Only JPG, PNG, and PDF are allowed.'), false);
        }
        cb(null, true);
    }
});

app.post('/api/files/upload', (req, res, next) => {
    upload.single('file')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'File is too large! Maximum limit is 5MB.' });
            }
            return res.status(400).json({ error: err.message });
        } else if (err) {
            return res.status(400).json({ error: err.message });
        }
        
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload a file' });
        }

        res.status(201).json({
            message: 'File uploaded successfully!',
            file: {
                originalName: req.file.originalname,
                storageName: req.file.key,
                size: req.file.size,
                url: req.file.location
            }
        });
    });
});

app.get('/api/files/download/:key', async (req, res) => {
    try {
        const { key } = req.params;

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key
        });

        const secureUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

        res.json({
            message: 'Secure download URL generated!',
            expiresIn: '15 minutes',
            downloadUrl: secureUrl
        });
    } catch (error) {
        console.error('Error generating secure URL:', error.message);
        res.status(500).json({ error: 'Internal Server Error', message: 'Could not generate secure link' });
    }
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
    console.log(`File Service is running on port ${PORT} and connected to AWS S3`);
});