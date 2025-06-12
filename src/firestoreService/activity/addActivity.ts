import { firestore } from 'firebase-admin';
import { db } from '../../firebaseAdminConfig';
import { type ActivityData } from '../types';
import { Timestamp } from 'firebase-admin/firestore';

export function addActivity(
  tripId: string,
  uid: string,
  activityDetails: Omit<ActivityData, 'userId' | 'tripId' | 'createdAt' | 'updatedAt'> & {
    startTime?: Date | Timestamp;
    endTime?: Date | Timestamp;
  }
): Promise<string | null> {
  const activitiesColRef = db.collection("activities");

  const startTimeTimestamp = activityDetails.startTime instanceof Date
    ? Timestamp.fromDate(activityDetails.startTime)
    : activityDetails.startTime;

  const endTimeTimestamp = activityDetails.endTime instanceof Date
    ? Timestamp.fromDate(activityDetails.endTime)
    : activityDetails.endTime;

  const newActivityData = {
    ...activityDetails,
    tripId: tripId,
    userId: uid,
    startTime: startTimeTimestamp,
    endTime: endTimeTimestamp,
    isBooked: activityDetails.isBooked || false,
    createdAt: firestore.FieldValue.serverTimestamp(),
    updatedAt: firestore.FieldValue.serverTimestamp(),
  };

  return activitiesColRef.add(newActivityData)
    .then((docRef) => {
      console.log(`New activity added with ID: ${docRef.id}`);
      return docRef.id;
    })
    .catch((error) => {
      console.error(`Error adding activity for trip ID ${tripId}: `, error);
      return null;
    });
}
