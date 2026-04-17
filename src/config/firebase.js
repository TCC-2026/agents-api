import admin from 'firebase-admin';
import { readFileSync } from 'fs';

let serviceAccount;

if (process.env.FIREBASE_CREDENTIALS) {
    serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
} else {
    serviceAccount = JSON.parse(readFileSync('./firebase-adminsdk.json', 'utf8'));
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
export default db;
