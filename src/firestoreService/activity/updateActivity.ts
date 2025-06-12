import { firestore } from 'firebase-admin';
import { db } from '../../firebaseAdminConfig';
import { type ActivityData } from '../types';

export type UpdatableActivityFields = Partial<Omit<ActivityData, 'userId' | 'tripId' | 'createdAt' | 'updatedAt'>>;

export function updateActivityDetails(activityId: string, updates: UpdatableActivityFields): Promise<boolean> {
  const activityDocRef = db.collection("activities").doc(activityId);

  const dataToUpdate = {
    ...updates,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  };

  return activityDocRef.set(dataToUpdate, { merge: true })
    .then(() => {
      console.log(`Activity with ID ${activityId} successfully updated.`);
      return true;
    })
    .catch((error: any) => {
      console.error(`Error updating activity with ID ${activityId}: `, error);
      return false;
    });
}