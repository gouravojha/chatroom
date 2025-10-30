import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { IUser, IUserResponse } from '../types';
import database from '../services/database';
import { AppError } from '../types';

export class User {
  static async create(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<IUser> {
    // Validate input
    if (!firstName || !lastName || !email || !password) {
      throw new AppError('All fields are required', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('Invalid email format', 400);
    }

    // Check if user already exists
    const existingUser = database.getUserByEmail(email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Validate password strength
    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user: IUser = {
      userId: uuidv4(),
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
    };

    return database.createUser(user);
  }

  static async validatePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static findByEmail(email: string): IUser | undefined {
    return database.getUserByEmail(email);
  }

  static findById(userId: string): IUser | undefined {
    return database.getUserById(userId);
  }

  static toResponse(user: IUser): IUserResponse {
    return {
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}