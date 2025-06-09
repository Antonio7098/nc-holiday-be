import { firestore } from 'firebase-admin';
import { db } from '../../../firebaseAdminConfig';
import { type TripData } from '../types';
import { Timestamp } from 'firebase-admin/firestore';

export function addTrip(
  uid: string,
  tripDetails: Omit<TripData, 'userId' | 'createdAt' | 'updatedAt' | 'cost'> & {
    startDate: Date | Timestamp;
    endDate: Date | Timestamp;
  }
): Promise<string | null> {
  const tripsColRef = db.collection("trips");

  const startDateTimestamp = tripDetails.startDate instanceof Date 
      ? Timestamp.fromDate(tripDetails.startDate) 
      : tripDetails.startDate;
  const endDateTimestamp = tripDetails.endDate instanceof Date 
      ? Timestamp.fromDate(tripDetails.endDate) 
      : tripDetails.endDate;

  const newTripData = {
    ...tripDetails,
    userId: uid,
    startDate: startDateTimestamp,
    endDate: endDateTimestamp,
    createdAt: firestore.FieldValue.serverTimestamp(),
    updatedAt: firestore.FieldValue.serverTimestamp(),
    cost: 0,
  };

  return tripsColRef.add(newTripData)
    .then((docRef) => {
      console.log(`Trip added with ID: ${docRef.id}`);
      return docRef.id;
    })
    .catch((error) => {
      console.error("Error adding new trip: ", error);
      return null;
    });
}
