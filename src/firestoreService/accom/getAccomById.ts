import { db } from '../../../firebaseAdminConfig';
import { type Accom, type AccomData} from '../types';
import { DocumentSnapshot, DocumentData } from 'firebase-admin/firestore';

export function getAccomById(accomId: string): Promise<Accom | null> {
    const accomDocRef = db.collection("accommodations").doc(accomId);

    return accomDocRef.get()
        .then((docSnap: DocumentSnapshot<DocumentData>) => {
            if (docSnap.exists) {
                return { id: docSnap.id, ...docSnap.data() } as Accom;
            }
            return null;
        })
        .catch((error: any) => {
            console.error(`Error getting accommodation with ID ${accomId}: `, error);
            return null;
        });
}