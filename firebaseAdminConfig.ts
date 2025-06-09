import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import path from 'path';

let serviceAccount: admin.ServiceAccount;

try {
  const keyPath = path.resolve(__dirname, './serviceAccountKey.json');
  serviceAccount = require(keyPath); 
} catch (error) {
  console.error("CRITICAL ERROR: serviceAccountKey.json not found. Please ensure the file exists in your backend project root.");
  process.exit(1); 
}

// Use the correct property names here
if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    console.error("CRITICAL ERROR: serviceAccountKey.json is invalid or malformed. It must contain 'projectId', 'clientEmail', and 'privateKey'.");
    process.exit(1);
}

// --- Emulator Configuration ---
if (process.env.NODE_ENV === 'test') {
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
  console.log("Connecting to local Firebase Emulators for testing.");
}

// --- Initialize the Firebase Admin App ---
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log(`Firebase Admin SDK initialized for project: ${serviceAccount.projectId}`);
}

// --- Export Initialized Services ---
export const db = getFirestore();
export const auth = getAuth();