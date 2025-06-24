// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: "AIzaSyC-p6IIotEfnPOQUxdcZO4PBJmYZ3ckaJI",

  authDomain: "trackmaxx-d4ee8.firebaseapp.com",

  projectId: "trackmaxx-d4ee8",

  storageBucket: "trackmaxx-d4ee8.firebasestorage.app",

  messagingSenderId: "1092704262004",

  appId: "1:1092704262004:web:b917c499b2f7e74e9bbe21",

  measurementId: "G-XQ2YWS0PGQ"

};

// ✅ Initialize Firebase
firebase.initializeApp(firebaseConfig);

// ✅ Set up Firebase services
const auth = firebase.auth();
const db = firebase.firestore();