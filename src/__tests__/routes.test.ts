import request from 'supertest';
import express from 'express';
import http from 'http';
import { Timestamp } from 'firebase-admin/firestore';

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

// Mock Firebase Admin SDK
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn()
  },
  firestore: jest.fn(() => ({
    collection: jest.fn()
  })),
  apps: []
}));

// Mock auth middleware
jest.mock('../authMiddleware', () => ({
  verifyUserToken: (req: any, res: any, next: () => void) => {
    req.user = { uid: 'test-user-123', email: 'test@example.com' };
    next();
  },
  verifyServiceKey: jest.fn((req, res, next) => next())
}));

// Import API after mocks
import api from '../api';

// Import and mock services
jest.mock('../firestoreService');
jest.mock('../amadaus/amadeusApi');

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

// Create typed mocks
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
    // Create a new Express app for testing
    app = express();
    app.use(express.json());
    app.use(api); // Mount the API routes
    
    // Start the server on a random available port
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
  
  // Helper function to make requests to our test server
  const requestWithPort = () => request(`http://localhost:${testPort}`);
  
  // Request helper function
  const makeRequest = () => request(`http://localhost:${testPort}`);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Trips API Endpoints', () => {
    describe('GET /api/trips', () => {
      test('should return a list of trips and a 200 status code', () => {
        const mockTrips: Trip[] = [{
          id: 'trip1',
          tripName: 'Test Trip',
          location: 'Test Location',
          cost: 1000,
          startDate: Timestamp.fromDate(new Date('2025-01-01')),
          endDate: Timestamp.fromDate(new Date('2025-01-07')),
          userId: 'test-user-123',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }];
        mockedGetTrips.mockResolvedValue(mockTrips);

        return request(app).get('/api/trips').then(response => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual(mockTrips);
          expect(mockedGetTrips).toHaveBeenCalledWith('test-user-123');
        });
      });
    });

    describe('POST /api/trips', () => {
      test('should create a new trip and return the new ID with a 201 status code', () => {
        const newTrip = {
          tripName: 'Test Trip',
          location: 'Test Location',
          cost: 1000,
          startDate: Timestamp.fromDate(new Date('2025-01-01')),
          endDate: Timestamp.fromDate(new Date('2025-01-07')),
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
        const mockTrip: Trip = {
          id: 'trip1',
          tripName: 'Test Trip',
          location: 'Test Location',
          cost: 1000,
          startDate: Timestamp.fromDate(new Date('2025-01-01')),
          endDate: Timestamp.fromDate(new Date('2025-01-07')),
          userId: 'test-user-123',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        mockedGetTripById.mockResolvedValue(mockTrip);

        return request(app).get('/api/trips/trip1').then(response => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual(mockTrip);
          expect(mockedGetTripById).toHaveBeenCalledWith('trip1');
        });
      });

      test('should return 403 Forbidden if the user does not own the trip', () => {
        const mockTrip: Trip = {
          id: 'trip1',
          tripName: 'Someone Elses Trip',
          location: 'Test Location',
          cost: 1000,
          startDate: Timestamp.fromDate(new Date('2025-01-01')),
          endDate: Timestamp.fromDate(new Date('2025-01-07')),
          userId: 'another-user-id',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
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
          startDate: Timestamp.fromDate(new Date('2025-01-01')),
          endDate: Timestamp.fromDate(new Date('2025-01-07')),
          userId: 'test-user-123',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
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
          startDate: Timestamp.fromDate(new Date('2025-01-01')),
          endDate: Timestamp.fromDate(new Date('2025-01-07')),
          userId: 'test-user-123',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
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
        const mockFlights: Flight[] = [{
          id: 'flight1',
          userId: 'test-user-123',
          tripId: 'trip1',
          airline: 'Test Air',
          flightNumber: 'TA123',
          departureLocation: 'LHR',
          arrivalLocation: 'CDG',
          departureTime: Timestamp.fromDate(new Date('2025-01-01T10:00:00Z')),
          arrivalTime: Timestamp.fromDate(new Date('2025-01-01T12:30:00Z')),
          cost: 200,
          createdAt: Timestamp.now(),
          stops: [],
          isBooked: false,
          updatedAt: Timestamp.now()
        }];
        
        mockedGetFlights.mockResolvedValue(mockFlights);

        return request(app).get('/api/trips/trip1/flights').then(response => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual(mockFlights);
          expect(mockedGetFlights).toHaveBeenCalledWith('trip1');
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