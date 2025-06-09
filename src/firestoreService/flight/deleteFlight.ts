import { db } from '../../../firebaseAdminConfig';

export function deleteFlight(flightId: string): Promise<boolean> {
    const flightDocRef = db.collection("flights").doc(flightId);

    return flightDocRef.delete()
        .then(() => {
            console.log(`Flight with ID ${flightId} successfully deleted.`);
            return true;
        })
        .catch((error: any) => {
            console.error(`Error deleting flight with ID ${flightId}: `, error);
            return false;
        });
}