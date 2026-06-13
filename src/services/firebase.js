import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

/* ── Auth ── */
export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function logout() {
  await signOut(auth);
}

/* ── Favorites (subcollection users/{uid}/favorites/{animeId}) ── */
export async function addFavorite(uid, anime) {
  const ref = doc(db, 'users', uid, 'favorites', String(anime.mal_id));
  await setDoc(ref, {
    animeId: anime.mal_id,
    title: anime.title_english || anime.title,
    image: anime.images?.jpg?.image_url || '',
    score: anime.score || null,
    genres: anime.genres?.map((g) => g.name) || [],
    savedAt: serverTimestamp(),
  });
}

export async function removeFavorite(uid, animeId) {
  const ref = doc(db, 'users', uid, 'favorites', String(animeId));
  await deleteDoc(ref);
}

export async function getFavorites(uid) {
  const snap = await getDocs(collection(db, 'users', uid, 'favorites'));
  return snap.docs.map((d) => d.data());
}
