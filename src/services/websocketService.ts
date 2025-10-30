import WebSocket from 'ws';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { IAuthenticatedWebSocket, IWebSocketMessage } from '../types';
import { Message } from '../models/Message';
import { Chatroom } from '../models/Chatroom';
import { User } from '../models/User';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

class WebSocketService {
  private wss: WebSocket.Server | null = null;
  private clients: Map<string, Set<IAuthenticatedWebSocket>> = new Map(); // roomId -> Set of WebSockets

  initialize(server: Server): void {
    this.wss = new WebSocket.Server({ server, path: '/ws' });

    this.wss.on('connection', (ws: IAuthenticatedWebSocket, req) => {
      logger.info('New WebSocket connection attempt');

      // Extract token from query string
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token) {
        ws.send(JSON.stringify({
          type: 'error',
          payload: { message: 'Authentication token is required' },
        }));
        ws.close();
        return;
      }

      try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as {
          userId: string;
          email: string;
        };
        ws.userId = decoded.userId;

        logger.info(`WebSocket authenticated for user: ${decoded.userId}`);

        // Handle messages
        ws.on('message', (data: WebSocket.Data) => {
          this.handleMessage(ws, data);
        });

        // Handle disconnect
        ws.on('close', () => {
          this.handleDisconnect(ws);
        });

        // Handle errors
        ws.on('error', (error) => {
          logger.error('WebSocket error:', error);
        });

      } catch (error) {
        logger.error('WebSocket authentication failed:', error);
        ws.send(JSON.stringify({
          type: 'error',
          payload: { message: 'Invalid or expired token' },
        }));
        ws.close();
      }
    });

    logger.info('WebSocket server initialized');
  }

  private handleMessage(ws: IAuthenticatedWebSocket, data: WebSocket.Data): void {
    try {
      const message: IWebSocketMessage = JSON.parse(data.toString());

      switch (message.type) {
        case 'join':
          this.handleJoinRoom(ws, message.payload);
          break;
        case 'leave':
          this.handleLeaveRoom(ws, message.payload);
          break;
        case 'message':
          this.handleChatMessage(ws, message.payload);
          break;
        default:
          ws.send(JSON.stringify({
            type: 'error',
            payload: { message: 'Unknown message type' },
          }));
      }
    } catch (error) {
      logger.error('Error handling WebSocket message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: 'Invalid message format' },
      }));
    }
  }

  private handleJoinRoom(ws: IAuthenticatedWebSocket, payload: any): void {
    const { roomId } = payload;
    const userId = ws.userId!;

    // Verify chatroom exists
    const chatroom = Chatroom.findById(roomId);
    if (!chatroom) {
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: 'Chatroom not found' },
      }));
      return;
    }

    // Add user to chatroom
    Chatroom.joinRoom(roomId, userId);

    // Store WebSocket connection
    if (!this.clients.has(roomId)) {
      this.clients.set(roomId, new Set());
    }
    this.clients.get(roomId)!.add(ws);
    ws.roomId = roomId;

    // Get user info
    const user = User.findById(userId);

    // Notify all clients in the room
    this.broadcastToRoom(roomId, {
      type: 'user_joined',
      payload: {
        userId,
        userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        timestamp: new Date(),
      },
    });

    // Send chat history to the joining user
    const messages = Message.getByRoomId(roomId);
    ws.send(JSON.stringify({
      type: 'history',
      payload: { messages },
    }));

    logger.info(`User ${userId} joined room ${roomId} via WebSocket`);
  }

  private handleLeaveRoom(ws: IAuthenticatedWebSocket, payload: any): void {
    const { roomId } = payload;
    const userId = ws.userId!;

    // Remove from chatroom
    Chatroom.leaveRoom(roomId, userId);

    // Remove WebSocket connection
    const roomClients = this.clients.get(roomId);
    if (roomClients) {
      roomClients.delete(ws);
      if (roomClients.size === 0) {
        this.clients.delete(roomId);
      }
    }
    ws.roomId = undefined;

    // Get user info
    const user = User.findById(userId);

    // Notify all clients in the room
    this.broadcastToRoom(roomId, {
      type: 'user_left',
      payload: {
        userId,
        userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        timestamp: new Date(),
      },
    });

    logger.info(`User ${userId} left room ${roomId} via WebSocket`);
  }

  private handleChatMessage(ws: IAuthenticatedWebSocket, payload: any): void {
    const { content } = payload;
    const userId = ws.userId!;
    const roomId = ws.roomId;

    if (!roomId) {
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: 'You must join a room first' },
      }));
      return;
    }

    try {
      // Create message
      const message = Message.create(userId, roomId, content);

      // Get user info
      const user = User.findById(userId);

      // Broadcast to all clients in the room
      this.broadcastToRoom(roomId, {
        type: 'message',
        payload: {
          ...message,
          senderName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        },
      });

      logger.debug(`Message sent in room ${roomId} by user ${userId}`);
    } catch (error: any) {
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: error.message || 'Failed to send message' },
      }));
    }
  }

  private handleDisconnect(ws: IAuthenticatedWebSocket): void {
    const userId = ws.userId;
    const roomId = ws.roomId;

    if (roomId && userId) {
      // Remove from room
      const roomClients = this.clients.get(roomId);
      if (roomClients) {
        roomClients.delete(ws);
        if (roomClients.size === 0) {
          this.clients.delete(roomId);
        }
      }

      // Get user info
      const user = User.findById(userId);

      // Notify others
      this.broadcastToRoom(roomId, {
        type: 'user_left',
        payload: {
          userId,
          userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
          timestamp: new Date(),
        },
      });

      logger.info(`User ${userId} disconnected from room ${roomId}`);
    }
  }

  private broadcastToRoom(roomId: string, message: IWebSocketMessage): void {
    const roomClients = this.clients.get(roomId);
    if (!roomClients) return;

    const messageStr = JSON.stringify(message);
    roomClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }
}

const websocketService = new WebSocketService();
export default websocketService;