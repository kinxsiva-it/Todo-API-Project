/* eslint-disable no-undef */

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD02eONiaMawL5aUvcPAMBTFPKXKaNNmo0",
  authDomain: "todo-api-project-notification.firebaseapp.com",
  projectId: "todo-api-project-notification",
  storageBucket: "todo-api-project-notification.firebasestorage.app",
  messagingSenderId: "238784860006",
  appId: "1:238784860006:web:42d6926abbe28c6aa1c2a7",
  measurementId: "G-B37V19DD0L"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] ได้รับข้อความเบื้องหลัง: ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png' 
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});