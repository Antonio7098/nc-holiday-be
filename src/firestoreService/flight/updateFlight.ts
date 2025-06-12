import { firestore } from 'firebase-admin';
import { db } from '../../firebaseAdminConfig';
import { type FlightData } from '../types';

export type UpdatableFlightFields = Partial<Omit<FlightData, 'userId' | 'tripId' | 'createdAt' | 'updatedAt'>>;

export function updateFlightDetails(flightId: string, updates: UpdatableFlightFields): Promise<boolean> {
  const flightDocRef = db.collection("flights").doc(flightId);

  const dataToUpdate = {
    ...updates,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  };

  return flightDocRef.set(dataToUpdate, { merge: true })
    .then(() => {
      console.log(`Flight with ID ${flightId} successfully updated.`);
      return true;
    })
    .catch((error: any) => {
      console.error(`Error updating flight with ID ${flightId}: `, error);
      return false;
    });
}