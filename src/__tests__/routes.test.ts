
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn()
  },
  firestore: jest.fn(() => ({
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
    add: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis()
  })),
  apps: []
}));

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(() => ({
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
    add: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis()
  })),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date() })),
    fromDate: jest.fn((date) => ({ toDate: () => date }))
  }
}));

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(() => ({
    verifyIdToken: jest.fn()
  }))
}));

import request from 'supertest';
import express from 'express';
import http from 'http';
import { Timestamp } from 'firebase-admin/firestore';
import { getTripById } from '../firestoreService';
import { getFlightsByTrip } from '../firestoreService';
import { getAccomsByTrip } from '../firestoreService';
import { getActivitiesByTrip } from '../firestoreService';

const createMockTimestamp = (seconds = Math.floor(Date.now() / 1000)) => {
  return {
    seconds,
    nanoseconds: 0,
    toDate: () => new Date(seconds * 1000),
    toMillis: () => seconds * 1000,
    isEqual: (other: any) => other && other.seconds === seconds && other.nanoseconds === 0,
    toJSON: () => ({
      _seconds: seconds,
      _nanoseconds: 0
    }),
    valueOf: () => seconds.toString()
  } as const as unknown as Timestamp;
};

// Define interfaces
interface Trip {
  id: string;
  tripName: string;
  location: string;
  cost: number;
  startDate: Timestamp;
  endDate: Timestamp;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Flight {
  id: string;
  userId: string;
  tripId: string;
  airline: string;
  flightNumber: string;
  departureLocation: string;
  arrivalLocation: string;
  departureTime: Timestamp;
  arrivalTime: Timestamp;
  cost: number;
  createdAt: Timestamp;
  stops: any[];
  isBooked: boolean;
  updatedAt: Timestamp;
}

// Firebase Admin SDK is now mocked at the top of the file

// Mock auth middleware
jest.mock('../authMiddleware', () => ({
  verifyUserToken: (req: any, res: any, next: () => void) => {
    req.user = { uid: 'test-user-123', email: 'test@example.com' };
    next();
  },
  verifyServiceKey: jest.fn((req, res, next) => next())
}));

import api from '../api';

let mockGetTrips: jest.Mock<Promise<Trip[]>, [string]>;
let mockGetTripById: jest.Mock<Promise<Trip | null>, [string]>;
let mockAddTrip: jest.Mock<Promise<Trip>, [Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>]>;
let mockUpdateTripDetails: jest.Mock<Promise<Trip>, [string, Partial<Omit<Trip, 'id' | 'userId' | 'createdAt'>>]>;
let mockDeleteTrip: jest.Mock<Promise<boolean>, [string]>;
let mockGetFlightsByTrip: jest.Mock<Promise<Flight[]>, [string]>;
let mockSearchFlights: jest.Mock;
let mockSearchHotels: jest.Mock;
let mockSearchActivities: jest.Mock;

jest.mock('../firestoreService', () => ({
  getTrips: jest.fn(),
  getTripById: jest.fn(),
  addTrip: jest.fn(),
  updateTripDetails: jest.fn(),
  deleteTrip: jest.fn(),
  getFlightsByTrip: jest.fn(),
  getAccomsByTrip: jest.fn(),
  addAccom: jest.fn(),
  updateAccom: jest.fn(),
  deleteAccom: jest.fn(),
  addFlight: jest.fn(),
  updateFlight: jest.fn(),
  deleteFlight: jest.fn(),
  addActivity: jest.fn(),
  updateActivity: jest.fn(),
  deleteActivity: jest.fn()
}));

jest.mock('../amadaus/amadeusApi', () => ({
  searchFlights: jest.fn(),
  searchHotelsByCity: jest.fn(),
  searchActivities: jest.fn()
}));

import * as firestoreService from '../firestoreService';
import * as amadeusApi from '../amadaus/amadeusApi';

beforeEach(() => {
  mockGetTrips = firestoreService.getTrips as jest.Mock;
  mockGetTripById = firestoreService.getTripById as jest.Mock;
  mockAddTrip = firestoreService.addTrip as jest.Mock;
  mockUpdateTripDetails = firestoreService.updateTripDetails as jest.Mock;
  mockDeleteTrip = firestoreService.deleteTrip as jest.Mock;
  mockGetFlightsByTrip = firestoreService.getFlightsByTrip as jest.Mock;
  
  mockSearchFlights = amadeusApi.searchFlights as jest.Mock;
  mockSearchHotels = amadeusApi.searchHotelsByCity as jest.Mock;
  mockSearchActivities = amadeusApi.searchActivities as jest.Mock;
  
  jest.clearAllMocks();
});



import {
  getTrips,
  getTripById,
  addTrip,
  updateTripDetails,
  deleteTrip,
  getFlightsByTrip
} from '../firestoreService';

import {
  searchFlights,
  searchHotelsByCity,
  searchActivities
} from '../amadaus/amadeusApi';

const mockedGetTrips = getTrips as jest.MockedFunction<typeof getTrips>;
const mockedGetTripById = getTripById as jest.MockedFunction<typeof getTripById>;
const mockedAddTrip = addTrip as jest.MockedFunction<typeof addTrip>;
const mockedUpdateTrip = updateTripDetails as jest.MockedFunction<typeof updateTripDetails>;
const mockedDeleteTrip = deleteTrip as jest.MockedFunction<typeof deleteTrip>;
const mockedGetFlights = getFlightsByTrip as jest.MockedFunction<typeof getFlightsByTrip>;
const mockedSearchFlights = searchFlights as jest.MockedFunction<typeof searchFlights>;
const mockedSearchHotels = searchHotelsByCity as jest.MockedFunction<typeof searchHotelsByCity>;
const mockedSearchActivities = searchActivities as jest.MockedFunction<typeof searchActivities>;

describe('API Endpoints', () => {
  let server: http.Server;
  let app: express.Express;
  let testPort: number;

  beforeAll((done) => {
    app = express();
    app.use(express.json());
    app.use(api); // Mount the API routes
    
    server = http.createServer(app);
    server.listen(0, () => {
      testPort = (server.address() as any).port;
      done();
    });
  });

  afterAll((done) => {
    jest.clearAllMocks();
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });
  
  const requestWithPort = () => request(`http://localhost:${testPort}`);
  
  const makeRequest = () => request(`http://localhost:${testPort}`);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Trips API Endpoints', () => {
    describe('GET /api/trips', () => {
      test('should return a list of trips and a 200 status code', () => {
        const now = createMockTimestamp();
        const mockTrip: Trip = {
          id: 'trip1',
          tripName: 'Test Trip',
          location: 'Test Location',
          cost: 1000,
          startDate: now,
          endDate: now,
          userId: 'test-user-123',
          createdAt: now,
          updatedAt: now
        };
        mockGetTrips.mockResolvedValue([mockTrip]);

        return request(app).get('/api/trips').then(response => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual([{
            ...mockTrip,
            startDate: expect.any(Object),
            endDate: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object)
          }]);
          expect(mockGetTrips).toHaveBeenCalledWith('test-user-123');
        });
      });
    });

    describe('POST /api/trips', () => {
      test('should create a new trip and return the new ID with a 201 status code', () => {
        const newTrip = {
          tripName: 'Test Trip',
          location: 'Test Location',
          cost: 1000,
          startDate: createMockTimestamp(),
          endDate: createMockTimestamp(),
          userId: 'test-user-123'
        };
        
        const expectedTrip = {
          ...newTrip,
          userId: 'test-user-123'
        };
        
        mockedAddTrip.mockResolvedValue('new-trip-id');

        return request(app)
          .post('/api/trips')
          .send(newTrip)
          .then(response => {
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(mockedAddTrip).toHaveBeenCalledWith(
              'test-user-123',
              expect.objectContaining({
                tripName: newTrip.tripName,
                location: newTrip.location,
                cost: newTrip.cost
              })
            );
          });
      });
    });

    describe('GET /api/trips/:tripId', () => {
      test('should return a single trip if the user owns it', () => {
        const now = createMockTimestamp();
        const mockTrip = {
          id: 'trip1',
          tripName: 'Test Trip',
          location: 'Test Location',
          cost: 1000,
          startDate: now,
          endDate: now,
          userId: 'test-user-123',
          createdAt: now,
          updatedAt: now
        };
        mockedGetTripById.mockResolvedValue(mockTrip);

        return request(app).get('/api/trips/trip1').then(response => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({
            ...mockTrip,
            startDate: expect.any(Object),
            endDate: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object)
          });
expect(mockGetTripById).toHaveBeenCalledWith('trip1');
        });
      });

      test('should return 403 Forbidden if the user does not own the trip', () => {
        const now = createMockTimestamp();
        const mockTrip = {
          id: 'trip1',
          tripName: 'Someone Elses Trip',
          location: 'Test Location',
          cost: 1000,
          startDate: now,
          endDate: now,
          userId: 'another-user-id',
          createdAt: now,
          updatedAt: now
        };
        mockedGetTripById.mockResolvedValue(mockTrip);

        return request(app).get('/api/trips/trip1').then(response => {
          expect(response.status).toBe(403);
        });
      });

      test('should return 404 Not Found if the trip does not exist', () => {
        mockedGetTripById.mockResolvedValue(null);

        return request(app).get('/api/trips/non-existent-trip').then(response => {
          expect(response.status).toBe(404);
        });
      });
    });

    describe('PATCH /api/trips/:tripId', () => {
      test('should update a trip and return a success message', () => {
        const existingTrip: Trip = {
          id: 'trip1',
          tripName: 'Old Name',
          location: 'Test Location',
          cost: 1000,
          startDate: createMockTimestamp(),
          endDate: createMockTimestamp(),
          userId: 'test-user-123',
          createdAt: createMockTimestamp(),
          updatedAt: createMockTimestamp()
        };
        
        const updates = {
          tripName: 'Updated Trip',
          location: 'Updated Location',
          cost: 1200
        };
        
        mockedGetTripById.mockResolvedValue(existingTrip);
        mockedUpdateTrip.mockResolvedValue(true);

        return request(app)
          .patch('/api/trips/trip1')
          .send(updates)
          .then(response => {
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Trip updated successfully' });
            expect(mockedUpdateTrip).toHaveBeenCalledWith('trip1', updates);
          });
      });
    });

    describe('DELETE /api/trips/:tripId', () => {
      test('should delete a trip and return a success message', () => {
        const existingTrip: Trip = {
          id: 'trip1',
          tripName: 'To Be Deleted',
          location: 'Test Location',
          cost: 1000,
          startDate: createMockTimestamp(),
          endDate: createMockTimestamp(),
          userId: 'test-user-123',
          createdAt: createMockTimestamp(),
          updatedAt: createMockTimestamp()
        };
        mockedGetTripById.mockResolvedValue(existingTrip);
        mockedDeleteTrip.mockResolvedValue(true);

        return request(app).delete('/api/trips/trip1').then(response => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({ message: 'Trip deleted successfully' });
        });
      });
    });

    describe('GET /api/trips/:tripId/flights', () => {
      test('should return a list of flights for a given trip', () => {
        const now = createMockTimestamp();
        const mockFlights = [{
          id: 'flight1',
          userId: 'test-user-123',
          tripId: 'trip1',
          airline: 'Test Air',
          flightNumber: 'TA123',
          departureLocation: 'LHR',
          arrivalLocation: 'CDG',
          departureTime: now,
          arrivalTime: now,
          cost: 200,
          createdAt: now,
          stops: [],
          isBooked: false,
          updatedAt: now
        }];
        mockedGetFlights.mockResolvedValue(mockFlights);

        return request(app).get('/api/trips/trip1/flights').then(response => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual(
            mockFlights.map(flight => ({
              ...flight,
              departureTime: expect.any(Object),
              arrivalTime: expect.any(Object),
              createdAt: expect.any(Object),
              updatedAt: expect.any(Object)
            }))
          );
expect(mockGetFlightsByTrip).toHaveBeenCalledWith('trip1');
        });
      });
    });
  });

  describe('Amadeus API Proxy Endpoints', () => {
    describe('GET /api/amadeus/flights', () => {
      test('should call the searchFlights service and return data on success', () => {
        const mockFlightData = { data: [{ id: 1, type: 'flight-offer' }] };
        const queryParams = { originLocationCode: 'LHR', destinationLocationCode: 'CDG', departureDate: '2025-10-20', adults: '1' };
        mockedSearchFlights.mockResolvedValue(mockFlightData);

        return request(app)
          .get('/api/amadeus/flights')
          .query(queryParams)
          .then(response => {
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockFlightData);
            expect(mockedSearchFlights).toHaveBeenCalledWith(queryParams);
          });
      });

      test('should return a 500 error if the flight service fails', () => {
        const queryParams = { originLocationCode: 'LHR' };
        mockedSearchFlights.mockRejectedValue(new Error('Amadeus API failure'));
        
        return request(app)
          .get('/api/amadeus/flights')
          .query(queryParams)
          .then(response => {
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Failed to search for flights.' });
          });
      });
    });

    describe('GET /api/amadeus/hotels', () => {
      test('should call the searchHotelsByCity service and return data', () => {
        const mockHotelData = { data: [{ type: 'hotel-offers' }] };
        const queryParams = { cityCode: 'PAR' };
        mockedSearchHotels.mockResolvedValue(mockHotelData);

        return request(app)
          .get('/api/amadeus/hotels')
          .query(queryParams)
          .then(response => {
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockHotelData);
            expect(mockedSearchHotels).toHaveBeenCalledWith(queryParams);
          });
      });
    });

    describe('GET /api/amadeus/activities', () => {
      test('should call the searchActivities service and return data', () => {
        const mockActivityData = { data: [{ id: '1', type: 'activity' }] };
        const queryParams = { 
          latitude: '48.86', 
          longitude: '2.33' 
        };
    
        mockedSearchActivities.mockResolvedValue(mockActivityData);
    
        return request(app)
          .get('/api/amadeus/activities')
          .query(queryParams)
          .then(response => {
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockActivityData);
            expect(mockedSearchActivities).toHaveBeenCalledWith(queryParams);
          });
      });
    });
  });


});