import { db } from '../../../firebaseAdminConfig';
import { type Flight, type FlightData } from '../types';
import { QuerySnapshot, DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';

export function getFlightsByTrip(tripId: string): Promise<Flight[] | null> {
    const flightsColRef = db.collection("flights");
    const q = flightsColRef.where("tripId", "==", tripId);
    
    return q.get()
        .then((querySnapshot: QuerySnapshot<DocumentData>) => {    
            const flights: Flight[] = [];
            querySnapshot.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
                flights.push({ id: docSnap.id, ...(docSnap.data() as FlightData) });
            });
            console.log(`Found ${flights.length} flights for trip ID ${tripId}:`, flights);
            return flights;
        })
        .catch((error: any) => {
            console.error(`Error getting flights for trip ID ${tripId}: `, error);
            return null;
        });
}