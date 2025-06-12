import { db } from '../../firebaseAdminConfig';
import { type Activity, type ActivityData } from '../types';
import { DocumentSnapshot, DocumentData } from 'firebase-admin/firestore';

export function getActivityById(activityId: string): Promise<Activity | null> {
    const activityDocRef = db.collection("activities").doc(activityId);

    return activityDocRef.get()
        .then((docSnap: DocumentSnapshot<DocumentData>) => {
            if (docSnap.exists) {
                return { id: docSnap.id, ...docSnap.data() } as Activity;
            }
            return null;
        })
        .catch((error: any) => {
            console.error(`Error deleting activity with ID ${activityId}: `, error);
            return null;
        });
}