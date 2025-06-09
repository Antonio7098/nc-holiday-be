import { App, getApp, initializeApp } from 'firebase-admin/app';
import { db } from '../../../firebaseAdminConfig';
import { type Accom, type Activity, type Flight } from '../types';
import { DocumentSnapshot, DocumentData } from 'firebase-admin/firestore';

let adminApp: App;

export const getTestAdminApp = (): App => {
  if (!adminApp) {
    try {
      adminApp = getApp("jest-admin-app");
    } catch (e) {
      adminApp = initializeApp({
        projectId: "emulator-id",
      }, "jest-admin-app");
    }
  }
  return adminApp;
};

export const clearFirestoreEmulatorData = async (): Promise<void> => {
  try {
    // Get all collections
    const collections = await db.listCollections();
    
    // Delete all documents in each collection
    const deletePromises = collections.map(async (collection) => {
      const querySnapshot = await collection.get();
      const batch = db.batch();
      
      querySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      // Execute batch delete
      if (querySnapshot.docs.length > 0) {
        await batch.commit();
      }
    });
    
    await Promise.all(deletePromises);
    
    // Add a small delay to ensure all deletes are processed
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (error) {
    console.error('Error clearing Firestore emulator data:', error);
    throw error; // Re-throw to fail the test
  }
};

export const getAccomById = (id: string): Promise<Accom | null> => {
  return db.collection("accommodations").doc(id).get()
    .then((docSnap: DocumentSnapshot<DocumentData>) => {
      if (docSnap.exists) {
        return { id: docSnap.id, ...docSnap.data() } as Accom;
      }
      return null;
    });
};

export const getFlightById = (id: string): Promise<Flight | null> => {
    return db.collection("flights").doc(id).get()
        .then((docSnap: DocumentSnapshot<DocumentData>) => {
            if (docSnap.exists) {
                return { id: docSnap.id, ...docSnap.data() } as Flight;
            }
            return null;
        });
};

export const getActivityById = (id: string): Promise<Activity | null> => {
    return db.collection("activities").doc(id).get()
        .then((docSnap: DocumentSnapshot<DocumentData>) => {
            if (docSnap.exists) {
                return { id: docSnap.id, ...docSnap.data() } as Activity;
            }
            return null;
        });
};
