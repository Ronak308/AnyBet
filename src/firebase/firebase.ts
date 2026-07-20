import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

export const firebaseConfig = {
  apiKey: "AIzaSyCXVaL75HbMlGJS4vEoy-5xERnCj_jeDIo",
  authDomain: "anybet-effd1.firebaseapp.com",
  projectId: "anybet-effd1",
  storageBucket: "anybet-effd1.firebasestorage.app",
  messagingSenderId: "473981004870",
  appId: "1:473981004870:web:3cf4f72190b9fead59ae47",
  measurementId: "G-2G1V4JPTES"
}

// Initialize Firebase (SSR-friendly and preventing duplicate initializations)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { app, auth, db, storage }
