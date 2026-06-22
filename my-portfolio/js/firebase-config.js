const firebaseConfig = {
  apiKey:            "AIzaSyAqeZ7sxFzvVNhSaIEW-9oioJbEt6gfo0I",
  authDomain:        "afini-portfolio.firebaseapp.com",
  projectId:         "afini-portfolio",
  storageBucket:     "afini-portfolio.firebasestorage.app",
  messagingSenderId: "641702156304",
  appId:             "1:641702156304:web:fea2b8f4b23340abeb9295"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
