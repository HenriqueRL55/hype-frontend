import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBsU6HFf7PAJjEicsQsh1DbFMe9_D1yLF0",
  authDomain: "hype-frontend.firebaseapp.com",
  projectId: "hype-frontend",
  storageBucket: "hype-frontend.firebasestorage.app",
  messagingSenderId: "406750384138",
  appId: "1:406750384138:web:737c20294f351ec32c4ff3"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

if (import.meta.env.DEV) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
  console.log("🔥 App Vue conectado aos emuladores do Firebase localmente!");
}

export { auth, db, storage };