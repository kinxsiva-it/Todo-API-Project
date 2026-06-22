const express = require('express');
const cors = require('cors');
const Queue = require('better-queue');
const nodemailer = require('nodemailer');
require('dotenv').config();

const createTestTransporter = require('./config/mailer');
const admin = require('./config/firebase');

const { getMessaging } = require('firebase-admin/messaging');

const app = express();
app.use(cors());
app.use(express.json());

const startService = async () => {

    const transporter = await createTestTransporter();
    const emailQueue = new Queue(async (task, cb) => {
        try {
            console.log(`\n[Email Queue] Sending email to: ${task.to}...`);
            const info = await transporter.sendMail({
                from: '"Todo API System" <noreply@todoapp.com>',
                to: task.to,
                subject: task.subject,
                text: task.body
            });
            console.log(`[Email Queue] Sent successfully! URL: ${nodemailer.getTestMessageUrl(info)}`);
            cb(null, info); 
        } catch (error) {
            console.error(`[Email Queue] Failed: ${error.message}`);
            cb(error);
        }
    }, { maxRetries: 3, retryDelay: 5000 });
    
    const pushQueue = new Queue(async (task, cb) => {
        try {
            console.log(`\n[Push Queue] Sending notification to FCM Token...`);
            
            const message = {
                notification: {
                    title: task.title,
                    body: task.body
                },
                token: task.fcmToken 
            };

            const response = await getMessaging().send(message);
            console.log(`[Push Queue] Sent successfully! Message ID: ${response}`);
            cb(null, response); 
        } catch (error) {
            console.error(`[Push Queue] Failed: ${error.message}`);
            cb(error);
        }
    }, { maxRetries: 3, retryDelay: 5000 });

    // Endpoint สำหรับส่งอีเมล
    app.post('/api/notifications/email', (req, res) => {
        const { to, subject, body } = req.body;
        if (!to || !subject || !body) return res.status(400).json({ error: 'Missing fields' });
        
        emailQueue.push({ to, subject, body });
        res.status(202).json({ message: 'Email queued successfully.' });
    });

    // Endpoint สำหรับยิง Push Notification
    app.post('/api/notifications/push', (req, res) => {
        const { fcmToken, title, body } = req.body;
        if (!fcmToken || !title || !body) return res.status(400).json({ error: 'Missing fields' });
        
        pushQueue.push({ fcmToken, title, body });
        res.status(202).json({ message: 'Push notification queued successfully.' });
    });

    
    const PORT = process.env.PORT || 7000;
    app.listen(PORT, () => {
        console.log(`\nNotification Service is running on port ${PORT}`);
    });
};

startService();
