import { Request } from 'express';
import WebSocket from 'ws';

// User Types
export interface IUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  createdAt: Date;
}

export interface IUserResponse {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
}

export interface ISignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: IUserResponse;
  token: string;
}

// Chatroom Types
export interface IChatroom {
  roomId: string;
  roomName: string;
  createdBy: string;
  participants: string[];
  createdAt: Date;
}

export interface ICreateChatroomRequest {
  roomName: string;
}

// Message Types
export interface IMessage {
  messageId: string;
  senderId: string;
  roomId: string;
  content: string;
  timestamp: Date;
}

export interface ISendMessageRequest {
  roomId: string;
  content: string;
}

// WebSocket Types
export interface IWebSocketMessage {
  type: 'join' | 'leave' | 'message' | 'error' | 'user_joined' | 'user_left';
  payload?: any;
}

export interface IAuthenticatedWebSocket extends WebSocket {
  userId?: string;
  roomId?: string;
}

// Express Request with User
export interface IAuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

// API Response Types
export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Error Types
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}