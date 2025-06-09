import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { verifyUserToken } from './authMiddleware';

import { 
    addTrip, getTripById, getTrips, updateTripDetails, deleteTrip,
    addAccom, getAccomsByTrip, updateAccomDetails, deleteAccom, getAccomById,
    addFlight, getFlightsByTrip, updateFlightDetails, deleteFlight, getFlightById,
    addActivity, getActivitiesByTrip, updateActivityDetails, deleteActivity, getActivityById
} from './firestoreService';

import {
    searchFlights,
    searchHotelsByCity,
    searchActivities
} from './amadaus/amadeusApi';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

const getUid = (req: express.Request): string => {
  return (req as any).user.uid;
}

app.get('/api/trips', verifyUserToken, (req, res) => {
  getTrips(getUid(req))
    .then(trips => res.status(200).json(trips))
    .catch(error => res.status(500).json({ error: 'Failed to get trips' }));
});

app.get('/api/trips/:tripId', verifyUserToken, (req, res) => {
  getTripById(req.params.tripId)
    .then(trip => {
      if (trip && trip.userId === getUid(req)) {
        res.status(200).json(trip);
      } else if (trip) {
        res.status(403).json({ error: 'Forbidden: You do not own this trip' });
      } else {
        res.status(404).json({ error: 'Trip not found' });
      }
    })
    .catch(error => res.status(500).json({ error: 'Failed to get trip' }));
});

app.post('/api/trips', verifyUserToken, (req, res) => {
  addTrip(getUid(req), req.body)
    .then(tripId => {
      if (tripId) {
        res.status(201).json({ id: tripId });
      } else {
        res.status(400).json({ error: 'Failed to create trip' });
      }
    })
    .catch(error => res.status(500).json({ error: 'Internal server error' }));
});

app.patch('/api/trips/:tripId', verifyUserToken, (req, res) => {
  getTripById(req.params.tripId).then(trip => {
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (trip.userId !== getUid(req)) return res.status(403).json({ error: 'Forbidden' });

    updateTripDetails(req.params.tripId, req.body)
      .then(success => {
        if (success) {
          res.status(200).json({ message: 'Trip updated successfully' });
        } else {
          res.status(400).json({ error: 'Failed to update trip' });
        }
      });
  }).catch(error => res.status(500).json({ error: 'Internal server error' }));
});

app.delete('/api/trips/:tripId', verifyUserToken, (req, res) => {
  getTripById(req.params.tripId).then(trip => {
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (trip.userId !== getUid(req)) return res.status(403).json({ error: 'Forbidden' });

    deleteTrip(req.params.tripId)
      .then(success => {
        if (success) {
          res.status(200).json({ message: 'Trip deleted successfully' });
        } else {
          res.status(400).json({ error: 'Failed to delete trip' });
        }
      });
  }).catch(error => res.status(500).json({ error: 'Internal server error' }));
});

// --- Flights ---
app.get('/api/trips/:tripId/flights', verifyUserToken, (req, res) => {
  getFlightsByTrip(req.params.tripId)
    .then(flights => res.status(200).json(flights))
    .catch(error => res.status(500).json({ error: 'Failed to get flights' }));
});

app.post('/api/trips/:tripId/flights', verifyUserToken, (req, res) => {
  addFlight(req.params.tripId, getUid(req), req.body)
    .then(flightId => res.status(201).json({ id: flightId }))
    .catch(error => res.status(500).json({ error: 'Failed to add flight' }));
});

app.patch('/api/flights/:flightId', verifyUserToken, (req, res) => {
    getFlightById(req.params.flightId).then(flight => {
        if (!flight) return res.status(404).json({ error: 'Flight not found' });
        if (flight.userId !== getUid(req)) return res.status(403).json({ error: 'Forbidden' });

        updateFlightDetails(req.params.flightId, req.body)
            .then(success => success ? res.status(200).json({ message: 'Flight updated' }) : res.status(400).json({ error: 'Update failed' }));
    }).catch(error => res.status(500).json({ error: 'Internal server error' }));
});

app.delete('/api/flights/:flightId', verifyUserToken, (req, res) => {
    getFlightById(req.params.flightId).then(flight => {
        if (!flight) return res.status(404).json({ error: 'Flight not found' });
        if (flight.userId !== getUid(req)) return res.status(403).json({ error: 'Forbidden' });

        deleteFlight(req.params.flightId)
            .then(success => success ? res.status(200).json({ message: 'Flight deleted' }) : res.status(400).json({ error: 'Delete failed' }));
    }).catch(error => res.status(500).json({ error: 'Internal server error' }));
});


// --- Accommodations ---
app.get('/api/trips/:tripId/accommodations', verifyUserToken, (req, res) => {
  getAccomsByTrip(req.params.tripId)
    .then(accoms => res.status(200).json(accoms))
    .catch(error => res.status(500).json({ error: 'Failed to get accommodations' }));
});

app.post('/api/trips/:tripId/accommodations', verifyUserToken, (req, res) => {
    addAccom(req.params.tripId, getUid(req), req.body)
      .then(accomId => res.status(201).json({ id: accomId }))
      .catch(error => res.status(500).json({ error: 'Failed to add accommodation' }));
});

app.patch('/api/accommodations/:accomId', verifyUserToken, (req, res) => {
    getAccomById(req.params.accomId).then(accom => {
        if (!accom) return res.status(404).json({ error: 'Accommodation not found' });
        if (accom.userId !== getUid(req)) return res.status(403).json({ error: 'Forbidden' });

        updateAccomDetails(req.params.accomId, req.body)
            .then(success => success ? res.status(200).json({ message: 'Accommodation updated' }) : res.status(400).json({ error: 'Update failed' }));
    }).catch(error => res.status(500).json({ error: 'Internal server error' }));
});

app.delete('/api/accommodations/:accomId', verifyUserToken, (req, res) => {
    getAccomById(req.params.accomId).then(accom => {
        if (!accom) return res.status(404).json({ error: 'Accommodation not found' });
        if (accom.userId !== getUid(req)) return res.status(403).json({ error: 'Forbidden' });

        deleteAccom(req.params.accomId)
            .then(success => success ? res.status(200).json({ message: 'Accommodation deleted' }) : res.status(400).json({ error: 'Delete failed' }));
    }).catch(error => res.status(500).json({ error: 'Internal server error' }));
});


// --- Activities ---
app.get('/api/trips/:tripId/activities', verifyUserToken, (req, res) => {
    getActivitiesByTrip(req.params.tripId)
      .then(activities => res.status(200).json(activities))
      .catch(error => res.status(500).json({ error: 'Failed to get activities' }));
});

app.post('/api/trips/:tripId/activities', verifyUserToken, (req, res) => {
    addActivity(req.params.tripId, getUid(req), req.body)
      .then(activityId => res.status(201).json({ id: activityId }))
      .catch(error => res.status(500).json({ error: 'Failed to add activity' }));
});

app.patch('/api/activities/:activityId', verifyUserToken, (req, res) => {
    getActivityById(req.params.activityId).then(activity => {
        if (!activity) return res.status(404).json({ error: 'Activity not found' });
        if (activity.userId !== getUid(req)) return res.status(403).json({ error: 'Forbidden' });

        updateActivityDetails(req.params.activityId, req.body)
            .then(success => success ? res.status(200).json({ message: 'Activity updated' }) : res.status(400).json({ error: 'Update failed' }));
    }).catch(error => res.status(500).json({ error: 'Internal server error' }));
});

app.delete('/api/activities/:activityId', verifyUserToken, (req, res) => {
    getActivityById(req.params.activityId).then(activity => {
        if (!activity) return res.status(404).json({ error: 'Activity not found' });
        if (activity.userId !== getUid(req)) return res.status(403).json({ error: 'Forbidden' });

        deleteActivity(req.params.activityId)
            .then(success => success ? res.status(200).json({ message: 'Activity deleted' }) : res.status(400).json({ error: 'Delete failed' }));
    }).catch(error => res.status(500).json({ error: 'Internal server error' }));
});

app.get('/api/amadeus/flights', verifyUserToken, (req, res) => {
    // req.query will contain parameters like originLocationCode, destinationLocationCode, etc.
    searchFlights(req.query)
        .then(data => {
            res.status(200).json(data);
        })
        .catch(error => {
            // Log the detailed error from Amadeus on the server
            console.error("Amadeus flights search error:", error.response?.data || error.message);
            // Send a generic error to the client
            res.status(error.response?.status || 500).json({ error: 'Failed to search for flights.' });
        });
});


app.get('/api/amadeus/hotels', verifyUserToken, (req, res) => {
    // req.query will contain parameters like cityCode
    searchHotelsByCity(req.query)
        .then(data => {
            res.status(200).json(data);
        })
        .catch(error => {
            console.error("Amadeus hotels search error:", error.response?.data || error.message);
            res.status(error.response?.status || 500).json({ error: 'Failed to search for hotels.' });
        });
});


app.get('/api/amadeus/activities', verifyUserToken, (req, res) => {
    // req.query will contain latitude and longitude
    searchActivities(req.query)
        .then(data => {
            res.status(200).json(data);
        })
        .catch(error => {
            console.error("Amadeus activities search error:", error.response?.data || error.message);
            res.status(error.response?.status || 500).json({ error: 'Failed to search for activities.' });
        });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
