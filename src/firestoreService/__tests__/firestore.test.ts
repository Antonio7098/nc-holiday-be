import {
  describe,
  test,
  expect,
  beforeEach,
  afterAll,
} from '@jest/globals';
import { UserRecord } from 'firebase-admin/auth';

import {
  setupTestUser,
  seedTestData,
  cleanupAfterTests,
  DIFFERENT_USER_ID,
  SAMPLE_TRIP_1_ID,
  SAMPLE_TRIP_2_ID,
  SAMPLE_ACCOM_1_ID,  
  SAMPLE_FLIGHT_1_ID, 
  SAMPLE_ACTIVITY_1_ID,
  sampleTrip1,
} from './testSetup';

import { Timestamp } from 'firebase-admin/firestore';

import {
    addTrip,
    getTripById,
    getTrips,
    deleteTrip,
    updateTripDetails,
    addAccom,
    getAccomsByTrip,
    deleteAccom,
    updateAccomDetails,
    addFlight,
    getFlightsByTrip,
    deleteFlight,
    updateFlightDetails,
    addActivity,
    getActivitiesByTrip,
    deleteActivity,
    updateActivityDetails,
} from '../../firestoreService'; 
import { getAccomById, getActivityById, getFlightById, clearFirestoreEmulatorData } from './testUtils';

describe('Firestore Service Tests', () => {
  let testUser: UserRecord;
  let testStartTime: number;

  beforeAll(async () => {
    console.log('Starting Firestore Service Tests...');
  });

  beforeEach(async () => {
    testStartTime = Date.now();
    const testName = expect.getState().currentTestName || 'unknown test';
    console.log(`\n--- Starting Test: ${testName} ---`);
    
    try {
      // Clear all test data first
      console.log('Cleaning up previous test data...');
      await cleanupAfterTests();
      
      // Setup test user
      console.log('Setting up test user...');
      testUser = await setupTestUser();
      if (!testUser) {
        throw new Error('Test setup failed: user was not initialized');
      }
      
      // Seed test data
      console.log('Seeding test data...');
      await seedTestData(testUser.uid);
      
      console.log('Test setup completed successfully');
      
      // Verify test data was seeded
      console.log('Verifying test data...');
      const [trip, accom, flight, activity] = await Promise.all([
        getTripById(SAMPLE_TRIP_1_ID),
        getAccomById(SAMPLE_ACCOM_1_ID),
        getFlightById(SAMPLE_FLIGHT_1_ID),
        getActivityById(SAMPLE_ACTIVITY_1_ID)
      ]);
      
      if (!trip || !accom || !flight || !activity) {
        throw new Error('Failed to verify all test data was seeded');
      }
      
      console.log('Test data verification passed');
    } catch (error) {
      console.error('Error in beforeEach:', error);
      throw error;
    }
  });

  afterEach(async () => {
    const testDuration = Date.now() - testStartTime;
    console.log(`\nTest completed in ${testDuration}ms`);
    
    try {
      console.log('Cleaning up test data...');
      await cleanupAfterTests();
      console.log('Cleanup completed successfully');
    } catch (error) {
      console.error('Error during test cleanup:', error);
      // Don't throw in afterEach as it might mask test failures
    }
  });

  afterAll(async () => {
    try {
      console.log('Running final cleanup...');
      await clearFirestoreEmulatorData();
      await cleanupAfterTests();
      console.log('All tests completed');
    } catch (error) {
      console.error('Error during final cleanup:', error);
      throw error;
    }
  });

  // --- GET Functions ---
  describe('GET Functions', () => {
    describe('getTripById', () => {
      test('should return the correct trip data for a valid ID', () => {
        return getTripById(SAMPLE_TRIP_1_ID)
          .then((trip) => {
            expect(trip).not.toBeNull();
            if (trip) {
              expect(trip.id).toBe(SAMPLE_TRIP_1_ID);
              expect(trip.tripName).toBe(sampleTrip1.tripName);
              expect(trip.userId).toBe(testUser.uid);
            }
          });
      });
      
      test('should return null for a non-existent trip ID', () => {
        return getTripById("THIS_ID_DOES_NOT_EXIST")
          .then((trip) => {
            expect(trip).toBeNull();
          });
      });
    });

    describe('getTrips', () => {
      test("should return a list of all the authenticated user's trips", () => {
        return getTrips(testUser.uid).then((trips) => {
          if (!trips) {
            fail('getTrips() returned null unexpectedly.');
            return;
          }
          expect(trips).toHaveLength(2);
          expect(trips.some(t => t.userId === DIFFERENT_USER_ID)).toBe(false);
        });
      });
    });

    describe('getAccomsByTrip', () => {
        test('should return the correct accommodations for a valid trip ID', () => {
            return getAccomsByTrip(SAMPLE_TRIP_1_ID).then(accoms => {
                expect(accoms).not.toBeNull();
                if(accoms) {
                    expect(accoms).toHaveLength(2);
                }
            });
        });
    });

    describe('getFlightsByTrip', () => {
        test('should return the correct flights for a valid trip ID', () => {
            return getFlightsByTrip(SAMPLE_TRIP_1_ID).then(flights => {
                expect(flights).not.toBeNull();
                if(flights) {
                    expect(flights).toHaveLength(2);
                }
            });
        });
    });

    describe('getActivitiesByTrip', () => {
        test('should return the correct activities for a valid trip ID', () => {
            return getActivitiesByTrip(SAMPLE_TRIP_1_ID).then(activities => {
                expect(activities).not.toBeNull();
                if(activities) {
                    expect(activities).toHaveLength(2);
                }
            });
        });
    });
  });

  // --- ADD Functions ---
  describe('ADD Functions', () => {
    describe('addTrip', () => {
      test('should add a new trip and return its ID', () => {
        const newTripData = {
          tripName: "New Zealand Adventure",
          location: "Queenstown",
          cost: 4000,
          startDate: Timestamp.fromDate(new Date("2026-01-01")),
          endDate: Timestamp.fromDate(new Date("2026-01-15")),
        };
        return addTrip(testUser.uid, newTripData).then(newTripId => {
          expect(newTripId).not.toBeNull();
          expect(typeof newTripId).toBe('string');
        });
      });
    });

    describe('addAccom', () => {
        test('updateAccomDetails should update specified fields', () => {
          const updates = { name: "Renovated Hotel" };
          return updateAccomDetails(SAMPLE_ACCOM_1_ID, updates)
            .then(success => {
              expect(success).toBe(true);
              return getAccomById(SAMPLE_ACCOM_1_ID);
            })
            .then(updatedAccom => {
              expect(updatedAccom?.name).toBe("Renovated Hotel");
            });
        });
      });
    });

    describe('addFlight', () => {
        test('should add a new flight and return its ID', () => {
            const newFlightData = { departureLocation: 'Auckland', arrivalLocation: 'Queenstown', cost: 300, departureTime: Timestamp.now(), arrivalTime: Timestamp.now(), isBooked: true, stops: [] };
            return addFlight(SAMPLE_TRIP_1_ID, testUser.uid, newFlightData).then(newFlightId => {
                expect(newFlightId).not.toBeNull();
                expect(typeof newFlightId).toBe('string');
            });
        });
    });

    describe('addActivity', () => {
        test('addActivity should add a new activity', () => {
          const newActivityData = {
            description: "Bungee Jumping",
            location: "Kawarau Bridge",
            cost: 200,
            isBooked: true,
            startTime: Timestamp.fromDate(new Date()),
            endTime: Timestamp.fromDate(new Date()),
          };

          return addActivity(SAMPLE_TRIP_1_ID, testUser.uid, newActivityData)
            .then(newActivityId => {
              expect(newActivityId).not.toBeNull();
              if (newActivityId) {
                return getActivityById(newActivityId).then(fetchedActivity => {
                  expect(fetchedActivity).not.toBeNull();
                  expect(fetchedActivity?.description).toBe("Bungee Jumping");
                });
              }
            });
        });
    });
  });

  // --- UPDATE Functions ---
  describe('UPDATE Functions', () => {
    describe('updateTripDetails', () => {
      test('should update specified fields of an existing trip', () => {
        const updates = { tripName: "Updated Paris Trip", cost: 1500 };
        return updateTripDetails(SAMPLE_TRIP_1_ID, updates)
          .then(success => {
            expect(success).toBe(true);
            return getTripById(SAMPLE_TRIP_1_ID);
          })
          .then(updatedTrip => {
            expect(updatedTrip?.tripName).toBe("Updated Paris Trip");
            expect(updatedTrip?.cost).toBe(1500);
          });
      });
    });

    describe('updateAccomDetails', () => {
        test('updateAccomDetails should update specified fields', () => {
      const updates = { name: "Renovated Hotel" };
      return updateAccomDetails(SAMPLE_ACCOM_1_ID, updates)
        .then(success => {
          expect(success).toBe(true);
          return getAccomById(SAMPLE_ACCOM_1_ID);
        })
        .then(updatedAccom => {
          expect(updatedAccom?.name).toBe("Renovated Hotel");
        });
    });
    });

    describe('updateFlightDetails', () => {
        test('should update specified fields of an existing flight', () => {
            const flightIdToUpdate = SAMPLE_FLIGHT_1_ID;
            const updates = {
                airline: "New Airline Express",
                cost: 350,
            };
            return updateFlightDetails(flightIdToUpdate, updates)
                .then(success => {
                    expect(success).toBe(true);
                    return getFlightById(flightIdToUpdate);
                })
                .then(updatedFlight => {
                    expect(updatedFlight?.airline).toBe("New Airline Express");
                    expect(updatedFlight?.cost).toBe(350);
                });
        });
    });

    describe('updateActivityDetails', () => {
        test('should update specified fields of an existing activity', () => {
            const activityIdToUpdate = SAMPLE_ACTIVITY_1_ID;
            const updates = {
                description: "Guided tour of the Louvre",
                cost: 30,
            };
            return updateActivityDetails(activityIdToUpdate, updates)
                .then(success => {
                    expect(success).toBe(true);
                    return getActivityById(activityIdToUpdate);
                })
                .then(updatedActivity => {
                    expect(updatedActivity?.description).toBe("Guided tour of the Louvre");
                    expect(updatedActivity?.cost).toBe(30);
                });
        });
    });
  });

  // --- DELETE Functions ---
  describe('DELETE Functions', () => {
    test('deleteTrip should remove a trip document', () => {
      return deleteTrip(SAMPLE_TRIP_1_ID)
        .then(success => {
          expect(success).toBe(true);
          return getTripById(SAMPLE_TRIP_1_ID);
        })
        .then(trip => {
          expect(trip).toBeNull();
        });
    });

    test('deleteAccom should remove an accommodation document', () => {
        return deleteAccom(SAMPLE_ACCOM_1_ID)
            .then(success => {
                expect(success).toBe(true);
                return getAccomById(SAMPLE_ACCOM_1_ID);
            })
            .then(accom => {
                expect(accom).toBeNull();
            });
    });

    test('deleteFlight should remove a flight document', () => {
        return deleteFlight(SAMPLE_FLIGHT_1_ID)
            .then(success => {
                expect(success).toBe(true);
                return getFlightById(SAMPLE_FLIGHT_1_ID);
            })
            .then(flight => {
                expect(flight).toBeNull();
            });
    });

    test('deleteActivity should remove an activity document', () => {
      return deleteActivity(SAMPLE_ACTIVITY_1_ID)
        .then(success => {
          expect(success).toBe(true);
          return getActivityById(SAMPLE_ACTIVITY_1_ID);
        })
        .then(activity => {
          expect(activity).toBeNull();
        });
    });
});