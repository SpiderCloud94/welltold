import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            process.env.EXPO_PUBLIC_FB_API_KEY,
  authDomain:        process.env.EXPO_PUBLIC_FB_AUTH_DOMAIN,
  projectId:         process.env.EXPO_PUBLIC_FB_PROJECT_ID,
  storageBucket:     process.env.EXPO_PUBLIC_FB_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FB_SENDER_ID,
  appId:             process.env.EXPO_PUBLIC_FB_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
