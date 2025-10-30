import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { generateToken } from '../middleware/authMiddleware';
import { ISignupRequest, ILoginRequest, AppError } from '../types';
import logger from '../utils/logger';

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { firstName, lastName, email, password } = req.body as ISignupRequest;

    // Create user
    const user = await User.create(firstName, lastName, email, password);

    // Generate token
    const token = generateToken(user.userId, user.email);

    logger.info(`User signed up: ${email}`);

    res.status(201).json({
      success: true,
      data: {
        user: User.toResponse(user),
        token,
      },
      message: 'User created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body as ILoginRequest;

    // Validate input
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    // Find user
    const user = User.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Validate password
    const isValidPassword = await User.validatePassword(password, user.password);
    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken(user.userId, user.email);

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      success: true,
      data: {
        user: User.toResponse(user),
        token,
      },
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
};