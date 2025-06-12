import { firestore } from 'firebase-admin';
import { db } from '../../firebaseAdminConfig';
import { type FlightData } from '../types';
import { Timestamp } from 'firebase-admin/firestore';

export function addFlight(
  tripId: string,
  uid: string,
  flightDetails: Omit<FlightData, 'userId' | 'tripId' | 'createdAt' | 'updatedAt'> & {
    departureTime: Date | Timestamp;
    arrivalTime: Date | Timestamp;
  }
): Promise<string | null> {
  const flightsColRef = db.collection("flights");

  const departureTimestamp = flightDetails.departureTime instanceof Date
    ? Timestamp.fromDate(flightDetails.departureTime)
    : flightDetails.departureTime;

  const arrivalTimestamp = flightDetails.arrivalTime instanceof Date
    ? Timestamp.fromDate(flightDetails.arrivalTime)
    : flightDetails.arrivalTime;

  const newFlightData = {
    ...flightDetails,
    tripId: tripId,
    userId: uid,
    departureTime: departureTimestamp,
    arrivalTime: arrivalTimestamp,
    isBooked: flightDetails.isBooked || false,
    createdAt: firestore.FieldValue.serverTimestamp(),
    updatedAt: firestore.FieldValue.serverTimestamp(),
  };

  return flightsColRef.add(newFlightData)
    .then((docRef) => {
      console.log(`New flight added with ID: ${docRef.id}`);
      return docRef.id;
    })
    .catch((error) => {
      console.error(`Error adding flight for trip ID ${tripId}: `, error);
      return null;
    });
}
