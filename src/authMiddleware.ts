import { Request, Response, NextFunction } from 'express';
import { auth } from '../firebaseAdminConfig';

export const verifyUserToken = (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return Promise.resolve(res.status(401).send({ error: 'Unauthorized: No token provided.' }));
  }

  const idToken = authHeader.split('Bearer ')[1];

  return auth.verifyIdToken(idToken)
    .then((decodedToken) => {
      (req as any).user = decodedToken;
      next();
    })
    .catch((error) => {
      console.error('Error verifying Firebase ID token:', error);
      return res.status(403).send({ error: 'Forbidden: Invalid token.' });
    });
};

export const verifyServiceKey = (req: Request, res: Response, next: NextFunction): void | Response => {
  const serviceKey = req.headers['x-api-key'];

  if (!serviceKey || serviceKey !== process.env.SERVICE_API_KEY) {
    return res.status(401).send({ error: 'Unauthorized: Invalid service API key.' });
  }

  next();
};