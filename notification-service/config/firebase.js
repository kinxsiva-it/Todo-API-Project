const { initializeApp, cert } = require('firebase-admin/app');
require('dotenv').config(); 

console.log('Initializing Firebase Admin SDK...');

try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    const firebaseApp = initializeApp({
        credential: cert(serviceAccount)
    });

    console.log('Firebase Admin SDK Initialized Successfully!');
    module.exports = firebaseApp;
    
} catch (error) {
    console.error('[Firebase Error]: ไม่สามารถอ่านค่า FIREBASE_SERVICE_ACCOUNT จาก .env ได้ หรือรูปแบบ JSON ไม่ถูกต้อง');
    console.error(error.message);
}