import { db } from '../../firebaseAdminConfig';

export function deleteAccom(accomId: string): Promise<boolean> {
    const accomDocRef = db.collection("accommodations").doc(accomId);

    return accomDocRef.delete()
        .then(() => {
            console.log(`Accommodation with ID ${accomId} successfully deleted.`);
            return true;
        })
        .catch((error: any) => {
            console.error(`Error deleting accommodation with ID ${accomId}: `, error);
            return false;
        });
}