import { db } from '../../../firebaseAdminConfig';

export function deleteActivity(activityId: string): Promise<boolean> {
    const activityDocRef = db.collection("activities").doc(activityId);

    return activityDocRef.delete()
        .then(() => {
            console.log(`Activity with ID ${activityId} successfully deleted.`);
            return true;
        })
        .catch((error: any) => {
            console.error(`Error deleting activity with ID ${activityId}: `, error);
            return false;
        });
}