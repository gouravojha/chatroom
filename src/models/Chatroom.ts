import { v4 as uuidv4 } from 'uuid';
import { IChatroom } from '../types';
import database from '../services/database';
import { AppError } from '../types';

export class Chatroom {
  static create(roomName: string, createdBy: string): IChatroom {
    // Validate input
    if (!roomName || !roomName.trim()) {
      throw new AppError('Room name is required', 400);
    }

    if (roomName.length < 3) {
      throw new AppError('Room name must be at least 3 characters long', 400);
    }

    if (roomName.length > 50) {
      throw new AppError('Room name must not exceed 50 characters', 400);
    }

    // Create chatroom
    const chatroom: IChatroom = {
      roomId: uuidv4(),
      roomName: roomName.trim(),
      createdBy,
      participants: [createdBy], // Creator automatically joins
      createdAt: new Date(),
    };

    return database.createChatroom(chatroom);
  }

  static findById(roomId: string): IChatroom | undefined {
    return database.getChatroomById(roomId);
  }

  static findAll(): IChatroom[] {
    return database.getAllChatrooms();
  }

  static joinRoom(roomId: string, userId: string): boolean {
    const chatroom = database.getChatroomById(roomId);
    if (!chatroom) {
      throw new AppError('Chatroom not found', 404);
    }

    return database.addParticipantToChatroom(roomId, userId);
  }

  static leaveRoom(roomId: string, userId: string): boolean {
    const chatroom = database.getChatroomById(roomId);
    if (!chatroom) {
      throw new AppError('Chatroom not found', 404);
    }

    return database.removeParticipantFromChatroom(roomId, userId);
  }

  static isParticipant(roomId: string, userId: string): boolean {
    const chatroom = database.getChatroomById(roomId);
    if (!chatroom) return false;

    return chatroom.participants.includes(userId);
  }
}