// import admin from 'firebase-admin';
// import { getFirestore } from 'firebase-admin/firestore';
// import { getAuth } from 'firebase-admin/auth';
// import path from 'path';

// let serviceAccount: admin.ServiceAccount;

// try {
//   const keyPath = path.resolve(__dirname, './serviceAccountKey.json');
//   serviceAccount = require(keyPath); 
// } catch (error) {
//   console.error("CRITICAL ERROR: serviceAccountKey.json not found. Please ensure the file exists in your backend project root.");
//   process.exit(1); 
// }

// // Use the correct property names here
// if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
//     console.error("CRITICAL ERROR: serviceAccountKey.json is invalid or malformed. It must contain 'projectId', 'clientEmail', and 'privateKey'.");
//     process.exit(1);
// }

// // --- Emulator Configuration ---
// if (process.env.NODE_ENV === 'test') {
//   process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
//   process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
//   console.log("Connecting to local Firebase Emulators for testing.");
// }

// // --- Initialize the Firebase Admin App ---
// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
//   console.log(`Firebase Admin SDK initialized for project: ${serviceAccount.projectId}`);
// }

// // --- Export Initialized Services ---
// export const db = getFirestore();
// export const auth = getAuth();

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env file for local development
import * as dotenv from 'dotenv';
dotenv.config();

let serviceAccount;

// --- This is the new, secure logic ---
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  // --- For Production (on Render) ---
  // Parse the JSON string from the environment variable
  console.log("Found FIREBASE_SERVICE_ACCOUNT_JSON environment variable. Initializing from environment...");
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } catch (e) {
    console.error("CRITICAL ERROR: Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON. Make sure it's valid JSON.", e);
    process.exit(1);
  }
} else {
  // --- For Local Development ---
  // Fall back to reading the file from the project root
  console.log("No environment variable found. Looking for serviceAccountKey.json file...");
  const serviceAccountKeyPath = path.join(__dirname, '..', 'serviceAccountKey.json'); // Adjust path to be relative from 'dist' folder
  
  if (fs.existsSync(serviceAccountKeyPath)) {
    serviceAccount = require(serviceAccountKeyPath);
  } else {
    console.error("CRITICAL ERROR: serviceAccountKey.json not found. Please ensure the file exists in your backend project root or set FIREBASE_SERVICE_ACCOUNT_JSON environment variable.");
    process.exit(1); // Stop the server from starting if credentials are not found
  }
}

// --- Initialize Firebase Admin SDK ---
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID, // Good practice to also have this in .env
  });
  console.log('Firebase Admin SDK initialized successfully.');
}

export const db = admin.firestore();
export const auth = admin.auth();