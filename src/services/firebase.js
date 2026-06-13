import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  getFirestore, doc, setDoc, deleteDoc,
  getDocs, collection, serverTimestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId:     process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
const provider    = new GoogleAuthProvider();

/* ── Auth ── */
export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  return result.user;
}
export async function logout() {
  await signOut(auth);
}

/* ── Helpers ── */
function animeDoc(uid, sub, animeId) {
  return doc(db, 'users', uid, sub, String(animeId));
}
function animePayload(anime) {
  return {
    animeId: anime.mal_id || anime.animeId,
    title:   anime.title_english || anime.title || '',
    image:   anime.images?.jpg?.image_url || anime.image || '',
    score:   anime.score  ?? null,
    year:    anime.year   ?? null,
    genres:  anime.genres?.map?.((g) => (typeof g === 'string' ? g : g.name)) ?? anime.genres ?? [],
    savedAt: serverTimestamp(),
  };
}

/* ── Favorites ── */
export const addFavorite    = (uid, anime) => setDoc(animeDoc(uid, 'favorites', anime.mal_id || anime.animeId), animePayload(anime));
export const removeFavorite = (uid, id)    => deleteDoc(animeDoc(uid, 'favorites', id));
export async function getFavorites(uid) {
  const snap = await getDocs(collection(db, 'users', uid, 'favorites'));
  return snap.docs.map((d) => d.data());
}

/* ── Watchlist ── */
export const addToWatchlist      = (uid, anime) => setDoc(animeDoc(uid, 'watchlist', anime.mal_id || anime.animeId), animePayload(anime));
export const removeFromWatchlist = (uid, id)    => deleteDoc(animeDoc(uid, 'watchlist', id));
export async function getWatchlist(uid) {
  const snap = await getDocs(collection(db, 'users', uid, 'watchlist'));
  return snap.docs.map((d) => d.data());
}