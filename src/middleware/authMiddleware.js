import jwt from 'jsonwebtoken';
import { ApiError } from './errorMiddleware.js';

export const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) throw new ApiError(401, 'Access Denied');

  try {
    const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET, {
      algorithms: ['HS256']
    });
    // we can now use user id in the request / SQL queries to only return data for that user
    req.user = verified;
    next();
  } catch (err) {
    throw new ApiError(403, 'Invalid Token');
  }
};
