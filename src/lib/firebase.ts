/* Firebase solo para el demo: cuando el proyecto avance, esto se cambia por
   Supabase. La caché persistente es lo que deja trabajar sin internet: los
   cambios se guardan en el navegador y suben solos al volver la conexión. */
import { getApps, initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, type Firestore } from 'firebase/firestore';

const config = {
  apiKey: 'AIzaSyC1D-VFJhy2jWwx__Q67Dvdk0U6G5KUJZ4',
  authDomain: 'medicore-879e2.firebaseapp.com',
  projectId: 'medicore-879e2',
  storageBucket: 'medicore-879e2.firebasestorage.app',
  messagingSenderId: '201528061875',
  appId: '1:201528061875:web:2904b0c5d3a17cdd5025c6',
};

let db: Firestore | null = null;

export function baseDeDatos(): Firestore {
  if (db) return db;
  if (getApps().length) {
    db = getFirestore(getApps()[0]);
    return db;
  }
  const app = initializeApp(config);
  db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
  return db;
}
