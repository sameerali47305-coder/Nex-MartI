importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCnRThB4Y84868IcnHQN8y2lZ_UUy0lOug",
  authDomain: "nex-mart-7d33e.firebaseapp.com",
  projectId: "nex-mart-7d33e",
  storageBucket: "nex-mart-7d33e.firebasestorage.app",
  messagingSenderId: "792231475189",
  appId: "1:792231475189:web:582597f0c302d2cc2e52bc",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || "NexMart", {
    body: body || "",
    icon: "/favicon.ico",
  });
});