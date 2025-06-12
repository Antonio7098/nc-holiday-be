import { firestore } from 'firebase-admin';
import { db } from '../../firebaseAdminConfig';
import { type TripData } from '../types';

export type UpdatableTripFields = Partial<Omit<TripData, 'userId' | 'createdAt' | 'updatedAt'>>;

export function updateTripDetails(tripId: string, updates: UpdatableTripFields): Promise<boolean> {
  const tripDocRef = db.collection("trips").doc(tripId);

  const dataToUpdate = {
    ...updates,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  };

  return tripDocRef.set(dataToUpdate, { merge: true })
    .then(() => {
      console.log(`Trip with ID ${tripId} successfully updated.`);
      return true;
    })
    .catch((error: any) => {
      console.error(`Error updating trip with ID ${tripId}: `, error);
      return false;
    });
}