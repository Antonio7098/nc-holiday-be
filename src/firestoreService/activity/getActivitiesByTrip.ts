import { db } from '../../../firebaseAdminConfig';
import { type Activity, type ActivityData } from '../types';
import { QuerySnapshot, DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';

export function getActivitiesByTrip(tripId: string): Promise<Activity[] | null> {
    const activitiesColRef = db.collection("activities");
    const q = activitiesColRef.where("tripId", "==", tripId);
    
    return q.get()
        .then((querySnapshot: QuerySnapshot<DocumentData>) => {    
            const activities: Activity[] = [];
            querySnapshot.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
                activities.push({ id: docSnap.id, ...(docSnap.data() as ActivityData) });
            });
            console.log(`Found ${activities.length} activities for trip ID ${tripId}:`, activities);
            return activities;
        })
        .catch((error: any) => {
            console.error(`Error getting activities for trip ID ${tripId}:`, error);
            return null;
        });
}