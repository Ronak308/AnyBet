import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCXVaL75HbMlGJS4vEoy-5xERnCj_jeDIo",
  authDomain: "anybet-effd1.firebaseapp.com",
  projectId: "anybet-effd1",
  storageBucket: "anybet-effd1.firebasestorage.app",
  messagingSenderId: "473981004870",
  appId: "1:473981004870:web:3cf4f72190b9fead59ae47",
  measurementId: "G-2G1V4JPTES"
}

// Initialize Firebase (safely handling HMR / re-initialization)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

let analytics: any = null
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app)
    }
  }).catch(() => {
    // Analytics optional fallback
  })
}

export { app, db, auth, analytics }
export default app
