// frontend/src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';
import api from './axios';

const firebaseConfig = {
  apiKey: "AIzaSyD02eONiaMawL5aUvcPAMBTFPKXKaNNmo0",
  authDomain: "todo-api-project-notification.firebaseapp.com",
  projectId: "todo-api-project-notification",
  storageBucket: "todo-api-project-notification.firebasestorage.app",
  messagingSenderId: "238784860006",
  appId: "1:238784860006:web:42d6926abbe28c6aa1c2a7",
  measurementId: "G-B37V19DD0L"
};

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

export const requestNotificationPermission = async () => {
  try {
    console.log('กำลังขอสิทธิ์การแจ้งเตือนจาก User...');
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('User อนุญาตให้แจ้งเตือนเรียบร้อย!');

      const currentToken = await getToken(messaging, { 
        vapidKey: 'BCup3ZK4gP0j2scN3oBxH83po7Fpc8QrExd3eCCWrrcllCbuKHOUFP31uT-40WmObpYwv3wBM4XwEPvjl6a2Nlo' 
      });
      
      if (currentToken) {
        console.log('FCM Token หน้าบ้านของคุณคือ:', currentToken);
        
        await api.post('/api/notifications/push', {
          fcmToken: currentToken,
          title: 'ยินดีด้วยครับ!',
          body: 'ระบบ Push Notification หน้าบ้านและหลังบ้านเชื่อมกันติดแล้ว'
        });
        
        return currentToken;
      } else {
        console.warn('ไม่สามารถดึง Token ได้ ตรวจสอบสิทธิ์หรือ VAPID Key');
      }
    } else {
      console.warn('User ปฏิเสธการแจ้งเตือน');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการทำ Push Notification:', error);
  }
};