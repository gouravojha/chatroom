import { IUser, IChatroom, IMessage } from '../types';
import logger from '../utils/logger';

/**
 * In-memory database service
 * In production, this would be replaced with a real database (PostgreSQL, MongoDB, etc.)
 */
class Database {
  private users: Map<string, IUser> = new Map();
  private chatrooms: Map<string, IChatroom> = new Map();
  private messages: Map<string, IMessage[]> = new Map(); // roomId -> messages[]
  private emailIndex: Map<string, string> = new Map(); // email -> userId

  constructor() {
    logger.info('Database initialized (in-memory)');
  }

  // User operations
  createUser(user: IUser): IUser {
    this.users.set(user.userId, user);
    this.emailIndex.set(user.email.toLowerCase(), user.userId);
    logger.debug(`User created: ${user.email}`);
    return user;
  }

  getUserById(userId: string): IUser | undefined {
    return this.users.get(userId);
  }

  getUserByEmail(email: string): IUser | undefined {
    const userId = this.emailIndex.get(email.toLowerCase());
    return userId ? this.users.get(userId) : undefined;
  }

  getAllUsers(): IUser[] {
    return Array.from(this.users.values());
  }

  // Chatroom operations
  createChatroom(chatroom: IChatroom): IChatroom {
    this.chatrooms.set(chatroom.roomId, chatroom);
    this.messages.set(chatroom.roomId, []);
    logger.debug(`Chatroom created: ${chatroom.roomName}`);
    return chatroom;
  }

  getChatroomById(roomId: string): IChatroom | undefined {
    return this.chatrooms.get(roomId);
  }

  getAllChatrooms(): IChatroom[] {
    return Array.from(this.chatrooms.values());
  }

  addParticipantToChatroom(roomId: string, userId: string): boolean {
    const chatroom = this.chatrooms.get(roomId);
    if (!chatroom) return false;

    if (!chatroom.participants.includes(userId)) {
      chatroom.participants.push(userId);
      logger.debug(`User ${userId} joined chatroom ${roomId}`);
    }
    return true;
  }

  removeParticipantFromChatroom(roomId: string, userId: string): boolean {
    const chatroom = this.chatrooms.get(roomId);
    if (!chatroom) return false;

    chatroom.participants = chatroom.participants.filter(id => id !== userId);
    logger.debug(`User ${userId} left chatroom ${roomId}`);
    return true;
  }

  // Message operations
  createMessage(message: IMessage): IMessage {
    const roomMessages = this.messages.get(message.roomId) || [];
    roomMessages.push(message);
    this.messages.set(message.roomId, roomMessages);
    logger.debug(`Message created in room ${message.roomId}`);
    return message;
  }

  getMessagesByRoomId(roomId: string, limit?: number): IMessage[] {
    const messages = this.messages.get(roomId) || [];
    if (limit) {
      return messages.slice(-limit);
    }
    return messages;
  }

  // Utility methods
  clearAll(): void {
    this.users.clear();
    this.chatrooms.clear();
    this.messages.clear();
    this.emailIndex.clear();
    logger.info('Database cleared');
  }
}

// Singleton instance
const database = new Database();
export default database;