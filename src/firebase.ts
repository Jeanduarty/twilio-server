import firebase from 'firebase/compat/app';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  appId: process.env.FIREBASE_APP_ID,
  authDomain: 'consumidor-iiot.firebaseapp.com',
  databaseURL: 'https://consumidor-iiot-default-rtdb.firebaseio.com',
  projectId: 'consumidor-iiot',
  storageBucket: 'consumidor-iiot.appspot.com',
  messagingSenderId: '352509819925'
};

// Initialize Firebase
export function firebaseApp(){
  const database = firebase.initializeApp(firebaseConfig);
  console.log("Firebase Inicilizado!");
  
  return database;
}



