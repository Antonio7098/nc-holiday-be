import { db } from '../../firebaseAdminConfig';
import { type Trip, type TripData } from '../types';
import { DocumentSnapshot, DocumentData } from 'firebase-admin/firestore';

export function getTripById(tripId: string): Promise<Trip | null> {
    const tripDocRef = db.collection("trips").doc(tripId);
    
    return tripDocRef.get()
        .then((tripSnap: DocumentSnapshot<DocumentData>) => {
            if (tripSnap.exists) {
                const tripDataFromFirestore = tripSnap.data() as TripData;
                const tripWithId: Trip = {
                    id: tripSnap.id,
                    ...tripDataFromFirestore
                };
                console.log("Trip object to be returned: ", tripWithId);
                return tripWithId;
            } else {
                console.log(`No trip document found with ID: ${tripId}`);
                return null;
            }
        })
        .catch((error) => {
            console.error(`Error getting trip with ID ${tripId}: `, error);
            return null;
        });
}