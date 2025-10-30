import { v4 as uuidv4 } from 'uuid';
import { IMessage } from '../types';
import database from '../services/database';
import { AppError } from '../types';

export class Message {
  static create(senderId: string, roomId: string, content: string): IMessage {
    // Validate input
    if (!content || !content.trim()) {
      throw new AppError('Message content is required', 400);
    }

    if (content.length > 1000) {
      throw new AppError('Message content must not exceed 1000 characters', 400);
    }

    // Verify chatroom exists
    const chatroom = database.getChatroomById(roomId);
    if (!chatroom) {
      throw new AppError('Chatroom not found', 404);
    }

    // Verify sender is a participant
    if (!chatroom.participants.includes(senderId)) {
      throw new AppError('User is not a participant of this chatroom', 403);
    }

    // Create message
    const message: IMessage = {
      messageId: uuidv4(),
      senderId,
      roomId,
      content: content.trim(),
      timestamp: new Date(),
    };

    return database.createMessage(message);
  }

  static getByRoomId(roomId: string, limit?: number): IMessage[] {
    return database.getMessagesByRoomId(roomId, limit);
  }
}