importScripts(
    'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js'
);

importScripts(
    'https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js'
);

firebase.initializeApp({
    apiKey: 'AIzaSyCL38pSXCFXFBaRM7V8uEcwIAL9gKjswxw',
    authDomain: 'endure-67eae.firebaseapp.com',
    projectId: 'endure-67eae',
    storageBucket: 'endure-67eae.firebasestorage.app',
    messagingSenderId: '428868038597',
    appId: '1:428868038597:web:e2294c8b0c3862929425ac'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

    console.log(
        '[firebase-messaging-sw.js] Mensaje recibido:',
        payload
    );

    const notificationTitle =
        payload.notification?.title || 'Endure';

    const notificationOptions = {
        body:
            payload.notification?.body ||
            'Tienes una nueva notificación.',
        icon: '/endure-store/assets/favicon.png'
    };

    self.registration.showNotification(
        notificationTitle,
        notificationOptions
    );
});