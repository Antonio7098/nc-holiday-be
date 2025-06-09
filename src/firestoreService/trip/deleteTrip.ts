import { db } from '../../../firebaseAdminConfig';

export function deleteTrip(tripId: string): Promise<boolean> {
    const tripDocRef = db.collection("trips").doc(tripId);

    return tripDocRef.delete()
        .then(() => {
            console.log(`Trip with ID ${tripId} successfully deleted.`);
            return true;
        })
        .catch((error: any) => {
            console.error(`Error deleting trip with ID ${tripId}: `, error);
            return false;
        });
}