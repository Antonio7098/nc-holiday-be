import { db } from '../../firebaseAdminConfig';
import { type Trip, type TripData } from '../types';
import { QuerySnapshot, DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';

export function getTrips(uid: string): Promise<Trip[] | null> {
    const tripsColRef = db.collection("trips");
    const q = tripsColRef.where("userId", "==", uid);
    
    return q.get()
        .then((querySnapshot: QuerySnapshot<DocumentData>) => {    
            const myTrips: Trip[] = [];
            querySnapshot.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
                const tripDocumentData = docSnap.data() as TripData;
                myTrips.push({ id: docSnap.id, ...tripDocumentData });
            });
            console.log(`Found ${myTrips.length} trips for user ID: ${uid}`);
            return myTrips;
        })
        .catch((error: any) => {
            console.error(`Error getting trips for user ID ${uid}: `, error);
            return null;
        });
}