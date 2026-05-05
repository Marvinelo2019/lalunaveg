import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyD5gShTcwGzSwqe0aEYt_wJxbcxB_Do_b4",
  authDomain: "luna-vegetariana.firebaseapp.com",
  projectId: "luna-vegetariana",
  storageBucket: "luna-vegetariana.firebasestorage.app",
  messagingSenderId: "444275004744",
  appId: "1:444275004744:web:cb8acbd69ebb5c63730f7d"
};

export const app = initializeApp(firebaseConfig);
export const db  = getFirestore(app);
export const auth = getAuth(app);