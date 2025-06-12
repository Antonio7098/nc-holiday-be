import { db } from '../../firebaseAdminConfig';
import { type Flight, type FlightData } from '../types';
import { DocumentSnapshot, DocumentData } from 'firebase-admin/firestore';

export function getFlightById(flightId: string): Promise<Flight | null> {
    const flightDocRef = db.collection("flights").doc(flightId);

    return flightDocRef.get()
        .then((docSnap: DocumentSnapshot<DocumentData>) => {
            if (docSnap.exists) {
                return { id: docSnap.id, ...docSnap.data() } as Flight;
            }
            return null;
        })
        .catch((error: any) => {
            console.error(`Error getting flight with ID ${flightId}: `, error);
            return null;
        });
}