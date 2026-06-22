const { initializeApp, cert } = require('firebase-admin/app');
require('dotenv').config();

console.log('⏳ Initializing Firebase Admin SDK...');

try {
    const firebaseApp = initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        })
    });

    console.log('Firebase Admin SDK Initialized Successfully!');
    module.exports = firebaseApp;
    
} catch (error) {
    console.error('[Firebase Error]: ไม่สามารถยืนยันตัวตนได้');
    console.error(error.message);
}