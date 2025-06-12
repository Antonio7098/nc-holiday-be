import { firestore } from 'firebase-admin';
import { db } from '../../firebaseAdminConfig';
import { type AccomData } from '../types';

export type UpdatableAccomFields = Partial<Omit<AccomData, 'userId' | 'tripId' | 'createdAt' | 'updatedAt'>>;

export function updateAccomDetails(accomId: string, updates: UpdatableAccomFields): Promise<boolean> {
  const accomDocRef = db.collection("accommodations").doc(accomId);

  const dataToUpdate = {
    ...updates,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  };

  // Use set with merge: true to create the document if it doesn't exist
  return accomDocRef.set(dataToUpdate, { merge: true })
    .then(() => {
      console.log(`Accommodation with ID ${accomId} successfully updated.`);
      return true;
    })
    .catch((error: any) => {
      console.error(`Error updating accommodation with ID ${accomId}: `, error);
      return false;
    });
}