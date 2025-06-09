import { firestore } from 'firebase-admin';
import { db } from '../../../firebaseAdminConfig';
import { type AccomData } from '../types';
import { Timestamp } from 'firebase-admin/firestore';

export function addAccom(
  tripId: string,
  uid: string,
  accomDetails: Omit<AccomData, 'userId' | 'tripId' | 'createdAt' | 'updatedAt'> & {
    startDate?: Date | Timestamp;
    endDate?: Date | Timestamp;
  }
): Promise<string | null> {

  const accomsColRef = db.collection("accommodations");

  const newAccomData = {
    ...accomDetails,
    tripId: tripId,
    userId: uid,
    isBooked: accomDetails.isBooked || false,
    createdAt: firestore.FieldValue.serverTimestamp(),
    updatedAt: firestore.FieldValue.serverTimestamp(),
  };

  return accomsColRef.add(newAccomData)
    .then((docRef) => {
      console.log(`New accommodation added with ID: ${docRef.id}`);
      return docRef.id;
    })
    .catch((error) => {
      console.error(`Error adding accommodation for trip ID ${tripId}: `, error);
      return null;
    });
}

