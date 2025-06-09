import { db } from '../../../firebaseAdminConfig';
import { type Accom, type AccomData } from '../types';
import { QuerySnapshot, DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';

export function getAccomsByTrip(tripId: string): Promise<Accom[] | null> {
    const accomsColRef = db.collection("accommodations");
    const q = accomsColRef.where("tripId", "==", tripId);
    
    return q.get()
        .then((querySnapshot: QuerySnapshot<DocumentData>) => {    
            const accommodations: Accom[] = [];
            querySnapshot.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
                accommodations.push({ id: docSnap.id, ...(docSnap.data() as AccomData) });
            });
            console.log(`Found ${accommodations.length} accommodations for trip ID ${tripId}:`, accommodations);
            return accommodations;
        })
        .catch((error: any) => {
            console.error(`Error getting accommodations for trip ID ${tripId}: `, error);
            return null;
        });
}