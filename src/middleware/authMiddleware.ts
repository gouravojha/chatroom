import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IAuthRequest, AppError } from '../types';
import logger from '../utils/logger';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

export const authenticateToken = (
    req: IAuthRequest,
    _: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            throw new AppError('Authentication token is required', 401);
    }

        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: string;
            email: string;
        };

        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            logger.error('Invalid token:', error.message);
            next(new AppError('Invalid or expired token', 401));
        } else {
            next(error);
        }
    }
};

export const generateToken = (userId: string, email: string): string => {
    return jwt.sign({ userId, email }, JWT_SECRET);
};