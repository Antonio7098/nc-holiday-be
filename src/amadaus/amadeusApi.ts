import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;
const AMADEUS_BASE_URL = 'https://test.api.amadeus.com';

let amadeusAccessToken: string | null = null;
let tokenExpiryTime: number | null = null;

const getAccessToken = (): Promise<string> => {
    if (amadeusAccessToken && tokenExpiryTime && Date.now() < tokenExpiryTime) {
        return Promise.resolve(amadeusAccessToken);
    }

    const authUrl = `${AMADEUS_BASE_URL}/v1/security/oauth2/token`;
    const data = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: AMADEUS_CLIENT_ID!,
        client_secret: AMADEUS_CLIENT_SECRET!,
    });

    return axios.post(authUrl, data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then((response) => {
        amadeusAccessToken = response.data.access_token;
        tokenExpiryTime = Date.now() + (response.data.expires_in * 1000);
        return amadeusAccessToken!;
    });
};

export const searchFlights = (params: any): Promise<any> => {
    return getAccessToken()
        .then((token) => {
            return axios.get(`${AMADEUS_BASE_URL}/v2/shopping/flight-offers`, {
                headers: { Authorization: `Bearer ${token}` },
                params: params
            });
        })
        .then((response) => response.data);
};

export const searchHotelsByCity = (params: any): Promise<any> => {
    return getAccessToken()
        .then((token) => {
            return axios.get(`${AMADEUS_BASE_URL}/v1/reference-data/locations/hotels/by-city`, {
                headers: { Authorization: `Bearer ${token}` },
                params: params
            });
        })
        .then((response) => response.data);
};

export const searchActivities = (params: any): Promise<any> => {
    return getAccessToken()
        .then((token) => {
            return axios.get(`${AMADEUS_BASE_URL}/v1/shopping/activities`, {
                headers: { Authorization: `Bearer ${token}` },
                params: params
            });
        })
        .then((response) => response.data);
};
