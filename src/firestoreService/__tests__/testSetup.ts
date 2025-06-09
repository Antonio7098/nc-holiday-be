import { getAuth, UserRecord } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { firestore } from 'firebase-admin';
import { db, auth } from '../../../firebaseAdminConfig';
import { 
    type TripData,
    type AccomData,
    type FlightData,
    type ActivityData
} from '../types';
import { clearFirestoreEmulatorData } from './testUtils';

// --- Reusable Constants ---
export const TEST_USER_EMAIL = "test@example.com";
export const TEST_USER_PASSWORD = "password123";
export const DIFFERENT_USER_ID = "anotherUser456";

// --- Document IDs ---
export const SAMPLE_TRIP_1_ID = 'trip1';
export const SAMPLE_TRIP_2_ID = 'trip2';
export const SAMPLE_OTHER_USER_TRIP_ID = 'otherTrip';
export const SAMPLE_ACCOM_1_ID = 'accom1';
export const SAMPLE_FLIGHT_1_ID = 'flight1';
export const SAMPLE_ACTIVITY_1_ID = 'activity1';

export const sampleTrip1: Omit<TripData, 'userId' | 'createdAt' | 'updatedAt'> = {
    tripName: "Jest Test Trip to Paris",
    location: "Paris, France",
    cost: 1200,
    startDate: Timestamp.fromDate(new Date("2025-08-01")),
    endDate: Timestamp.fromDate(new Date("2025-08-08")),
};

export const sampleTrip2: Omit<TripData, 'userId' | 'createdAt' | 'updatedAt'> = {
    tripName: "SE Asia",
    location: "Indonesia",
    cost: 500,
    startDate: Timestamp.fromDate(new Date("2025-06-17")),
    endDate: Timestamp.fromDate(new Date("2025-08-17")),
};

export const otherUserTrip: Omit<TripData, 'userId' | 'createdAt' | 'updatedAt'> = {
    tripName: "Africa",
    location: "Sahara Desert",
    cost: 800,
    startDate: Timestamp.fromDate(new Date("2025-11-01")),
    endDate: Timestamp.fromDate(new Date("2025-11-05")),
};

export const accom1ForTrip1: Omit<AccomData, 'tripId' | 'userId' | 'createdAt' | 'updatedAt'> = {
  name: 'Hotel du Centre',
  location: '1st arrondissement, Paris, France',
  cost: 850,
  startDate: Timestamp.fromDate(new Date("2025-08-01")),
  endDate: Timestamp.fromDate(new Date("2025-08-08")),
  stars: 4,
  rooms: 1,
  beds: 1,
  description: 'A lovely hotel near the Louvre.',
  isBooked: true,
};

export const accom2ForTrip1: Omit<AccomData, 'tripId' | 'userId' | 'createdAt' | 'updatedAt'> = {
  name: 'Black Hotel',
  location: '1st black, Blackville street, Blackson',
  cost: 850,
  startDate: Timestamp.fromDate(new Date("2025-08-01")),
  endDate: Timestamp.fromDate(new Date("2025-08-08")),
  stars: 4,
  rooms: 1,
  beds: 1,
  description: 'A black hotel',
  isBooked: false,
};

export const accom1ForTrip2: Omit<AccomData, 'tripId' | 'userId' | 'createdAt' | 'updatedAt'> = {
  name: 'White',
  location: '1st white, Whiteville street, Whiteson',
  cost: 850,
  startDate: Timestamp.fromDate(new Date("2025-08-01")),
  endDate: Timestamp.fromDate(new Date("2025-08-08")),
  stars: 4,
  rooms: 1,
  beds: 1,
  description: 'A white hotel',
  isBooked: false,
};

export const accomForOtherUser: Omit<AccomData, 'tripId' | 'userId' | 'createdAt' | 'updatedAt'> = {
  name: 'Bog',
  location: '3rd Bog, Bogtown, The Boglands',
  cost: 850,
  startDate: Timestamp.fromDate(new Date("2025-08-01")),
  endDate: Timestamp.fromDate(new Date("2025-08-08")),
  stars: 4,
  rooms: 1,
  beds: 1,
  description: 'Bog',
  isBooked: false,
};

export const flight1ForTrip1: Omit<FlightData, 'tripId' | 'userId' | 'createdAt' | 'updatedAt' > = {
  departureLocation: 'London Heathrow',
  arrivalLocation: 'Paris',
  departureTime: Timestamp.fromDate(new Date("2025-08-01T07:00:00Z")),
  arrivalTime: Timestamp.fromDate(new Date("2025-08-01T09:20:00Z")),
  airline: 'Ryanaie',
  cost: 250,
  isBooked: true,
  stops: [],
};

export const flight2ForTrip1: Omit<FlightData, 'tripId' | 'userId' | 'createdAt' | 'updatedAt' > = {
  departureLocation: 'Paris',
  arrivalLocation: 'London Heathrow',
  departureTime: Timestamp.fromDate(new Date("2025-08-08T18:00:00Z")),
  arrivalTime: Timestamp.fromDate(new Date("2025-08-08T18:20:00Z")),
  airline: 'Air',
  cost: 280,
  isBooked: false,
  stops: [],
};

export const flight1ForTrip2: Omit<FlightData, 'tripId' | 'userId' | 'createdAt' | 'updatedAt' > = {
  departureLocation: 'Manchester',
  arrivalLocation: 'Denpasar',
  departureTime: Timestamp.fromDate(new Date("2025-06-16T21:00:00Z")),
  arrivalTime: Timestamp.fromDate(new Date("2025-06-17T20:00:00Z")),
  stops: [],
  airline: 'Qatar Airways',
  cost: 950,
  isBooked: true,
};

export const flightForOtherUser: Omit<FlightData, 'tripId' | 'userId' | 'createdAt' | 'updatedAt' > = {
  departureLocation: 'Haiti',
  arrivalLocation: 'The moon',
  departureTime: Timestamp.fromDate(new Date("2025-06-16T21:00:00Z")),
  arrivalTime: Timestamp.fromDate(new Date("2025-06-17T20:00:00Z")),
  stops: [],
  airline: 'NASA',
  cost: 950000000,
  isBooked: true,
};

export const activity1ForTrip1: Omit<ActivityData, 'tripId' | 'userId' | 'createdAt' | 'updatedAt' > = {
  description: 'Visit the Louvre Museum',
  location: 'Louvre Museum',
  cost: 22,
  startTime: Timestamp.fromDate(new Date("2025-08-02T10:00:00Z")),
  endTime: Timestamp.fromDate(new Date("2025-08-02T14:00:00Z")),
  isBooked: true,
};

export const activity2ForTrip1: Omit<ActivityData, 'tripId' | 'userId' | 'createdAt' | 'updatedAt' > = {
  description: 'Explore',
  location: 'Paris, France',
  cost: 0,
  startTime: Timestamp.fromDate(new Date("2025-08-03T15:00:00Z")),
  endTime: Timestamp.fromDate(new Date("2025-08-03T18:00:00Z")),
  isBooked: false,
};

export const activity1ForTrip2: Omit<ActivityData, 'tripId' | 'userId' | 'createdAt' | 'updatedAt' > = {
  description: 'Snorkeling',
  location: 'Bali, Indonesia',
  cost: 50,
  startTime: Timestamp.fromDate(new Date("2025-06-18T09:00:00Z")),
  endTime: Timestamp.fromDate(new Date("2025-06-18T11:00:00Z")),
  isBooked: true,
};

export const activityForOtherUser: Omit<ActivityData, 'tripId' | 'userId' | 'createdAt' | 'updatedAt' > = {
  description: 'Eating rocks',
  location: 'Bali, Indonesia',
  cost: 50,
  startTime: Timestamp.fromDate(new Date("2025-06-18T09:00:00Z")),
  endTime: Timestamp.fromDate(new Date("2025-06-18T11:00:00Z")),
  isBooked: true,
};

export function setupTestUser(): Promise<UserRecord> {
    return auth.getUserByEmail(TEST_USER_EMAIL)
        .catch((error: any) => {
            if (error.code === 'auth/user-not-found') {
                return auth.createUser({
                    email: TEST_USER_EMAIL,
                    password: TEST_USER_PASSWORD,
                });
            }
            throw error;
        });
}

export async function seedTestData(uid: string): Promise<void> {
    console.log('Starting to seed test data...');
    const now = new Date();
    
    const documentsToSeed = [
        // Trips
        { 
            collection: "trips", 
            id: SAMPLE_TRIP_1_ID, 
            data: { 
                ...sampleTrip1, 
                userId: uid, 
                createdAt: Timestamp.fromDate(now), 
                updatedAt: Timestamp.fromDate(now) 
            } 
        },
        { 
            collection: "trips", 
            id: SAMPLE_TRIP_2_ID, 
            data: { 
                ...sampleTrip2, 
                userId: uid, 
                createdAt: Timestamp.fromDate(now), 
                updatedAt: Timestamp.fromDate(now) 
            } 
        },
        { 
            collection: "trips", 
            id: SAMPLE_OTHER_USER_TRIP_ID, 
            data: { 
                ...otherUserTrip, 
                userId: DIFFERENT_USER_ID, 
                createdAt: Timestamp.fromDate(now), 
                updatedAt: Timestamp.fromDate(now) 
            } 
        },
        
        // Accommodations
        { 
            collection: "accommodations", 
            id: "accom1", 
            data: { 
                ...accom1ForTrip1, 
                tripId: SAMPLE_TRIP_1_ID, 
                userId: uid, 
                createdAt: Timestamp.fromDate(now), 
                updatedAt: Timestamp.fromDate(now) 
            } 
        },
        { 
            collection: "accommodations", 
            id: "accom2", 
            data: { 
                ...accom2ForTrip1, 
                tripId: SAMPLE_TRIP_1_ID, 
                userId: uid, 
                createdAt: Timestamp.fromDate(now), 
                updatedAt: Timestamp.fromDate(now) 
            } 
        },
        { 
            collection: "accommodations", 
            id: "accom3", 
            data: { 
                ...accom1ForTrip2, 
                tripId: SAMPLE_TRIP_2_ID, 
                userId: uid, 
                createdAt: Timestamp.fromDate(now), 
                updatedAt: Timestamp.fromDate(now) 
            } 
        },
        { 
            collection: "accommodations", 
            id: "accom4", 
            data: { 
                ...accomForOtherUser, 
                tripId: SAMPLE_OTHER_USER_TRIP_ID, 
                userId: DIFFERENT_USER_ID, 
                createdAt: Timestamp.fromDate(now), 
                updatedAt: Timestamp.fromDate(now) 
            } 
        },
        
        // Flights
        { 
            collection: "flights", 
            id: "flight1", 
            data: { 
                ...flight1ForTrip1, 
                tripId: SAMPLE_TRIP_1_ID, 
                userId: uid, 
                createdAt: Timestamp.fromDate(now), 
                updatedAt: Timestamp.fromDate(now) 
            } 
        },
        { 
            collection: "flights", 
            id: "flight2", 
            data: { 
                ...flight2ForTrip1, 
                tripId: SAMPLE_TRIP_1_ID, 
                userId: uid, 
                createdAt: Timestamp.fromDate(now), 
                updatedAt: Timestamp.fromDate(now) 
            } 
        },
        { 
            collection: "flights", 
            id: "flight3", 
            data: { 
                ...flight1ForTrip2, 
                tripId: SAMPLE_TRIP_2_ID, 
                userId: uid, 
                createdAt: Timestamp.fromDate(now), 
                updatedAt: Timestamp.fromDate(now) 
            } 
        },
        { 
            collection: "flights", 
            id: "flight4", 
            data: { 
                ...flightForOtherUser, 
                tripId: SAMPLE_OTHER_USER_TRIP_ID, 
                userId: DIFFERENT_USER_ID, 
                createdAt: Timestamp.fromDate(now), 
                updatedAt: Timestamp.fromDate(now) 
            } 
        },

        // Activities
        { 
            collection: "activities", 
            id: "activity1", 
            data: { 
                ...activity1ForTrip1, 
                tripId: SAMPLE_TRIP_1_ID, 
                userId: uid, 
                createdAt: Timestamp.fromDate(now), 
                updatedAt: Timestamp.fromDate(now) 
            } 
        },
        { 
            collection: "activities", 
            id: "activity2", 
            data: { 
                ...activity2ForTrip1, 
                tripId: SAMPLE_TRIP_1_ID, 
                userId: uid, 
                createdAt: Timestamp.fromDate(now), 
                updatedAt: Timestamp.fromDate(now) 
            } 
        },
        { 
            collection: "activities", 
            id: "activity3", 
            data: { 
                ...activity1ForTrip2, 
                tripId: SAMPLE_TRIP_2_ID, 
                userId: uid, 
                createdAt: Timestamp.fromDate(now), 
                updatedAt: Timestamp.fromDate(now) 
            } 
        },
        { 
            collection: "activities", 
            id: "activity4", 
            data: { 
                ...activityForOtherUser, 
                tripId: SAMPLE_OTHER_USER_TRIP_ID, 
                userId: DIFFERENT_USER_ID, 
                createdAt: Timestamp.fromDate(now), 
                updatedAt: Timestamp.fromDate(now) 
            } 
        }
    ];

    // Process in smaller batches to avoid timeouts
    const BATCH_SIZE = 5;
    for (let i = 0; i < documentsToSeed.length; i += BATCH_SIZE) {
        const batch = db.batch();
        const batchDocs = documentsToSeed.slice(i, i + BATCH_SIZE);
        
        for (const docToSeed of batchDocs) {
            const docRef = db.collection(docToSeed.collection).doc(docToSeed.id);
            console.log(`Adding to batch: ${docToSeed.collection}/${docToSeed.id}`);
            batch.set(docRef, docToSeed.data);
        }
        
        try {
            console.log(`Committing batch ${i / BATCH_SIZE + 1}...`);
            await batch.commit();
            console.log(`Batch ${i / BATCH_SIZE + 1} committed successfully`);
        } catch (error) {
            console.error(`Error committing batch ${i / BATCH_SIZE + 1}:`, error);
            throw error;
        }
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`Successfully seeded ${documentsToSeed.length} test documents for user: ${uid}`);
    
    // Verify that all documents were created successfully
    console.log('Verifying test data was seeded correctly...');
    const verificationPromises = documentsToSeed.map(async (docToVerify) => {
        try {
            const doc = await db.collection(docToVerify.collection).doc(docToVerify.id).get();
            if (!doc.exists) {
                console.error(`Document not found: ${docToVerify.collection}/${docToVerify.id}`);
                return false;
            }
            console.log(`Verified: ${docToVerify.collection}/${docToVerify.id}`);
            return true;
        } catch (error) {
            console.error(`Error verifying document ${docToVerify.collection}/${docToVerify.id}:`, error);
            return false;
        }
    });
    
    const results = await Promise.all(verificationPromises);
    const success = results.every(Boolean);
    
    if (!success) {
        throw new Error('Failed to verify all test documents were created');
    }
    
    console.log('Test data verification completed successfully');
}

export async function cleanupAfterTests(): Promise<void> {
    console.log('Cleaning up test data...');
    
    // List of all collections to clear
    const collections = ['trips', 'accommodations', 'flights', 'activities'];
    
    try {
        // Clear each collection
        for (const collection of collections) {
            console.log(`Clearing collection: ${collection}`);
            const querySnapshot = await db.collection(collection).get();
            const batch = db.batch();
            
            querySnapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            
            if (querySnapshot.size > 0) {
                await batch.commit();
                console.log(`Deleted ${querySnapshot.size} documents from ${collection}`);
            } else {
                console.log(`No documents to delete in ${collection}`);
            }
            
            // Small delay between collections
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('Test data cleanup completed successfully');
    } catch (error) {
        console.error('Error during test cleanup:', error);
        throw error;
    }
    
    return clearFirestoreEmulatorData()
      .then(() => {
        return auth.getUserByEmail(TEST_USER_EMAIL)
          .then(user => auth.deleteUser(user.uid))
          .catch(() => {}); // Suppress error if user already deleted
      });
}
