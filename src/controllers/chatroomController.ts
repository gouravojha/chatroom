import { Response, NextFunction } from 'express';
import { Chatroom } from '../models/Chatroom';
import { IAuthRequest, ICreateChatroomRequest } from '../types';
import logger from '../utils/logger';

export const createChatroom = (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { roomName } = req.body as ICreateChatroomRequest;
    const userId = req.user!.userId;

    const chatroom = Chatroom.create(roomName, userId);

    logger.info(`Chatroom created: ${roomName} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: chatroom,
      message: 'Chatroom created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getAllChatrooms = (
  _: IAuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const chatrooms = Chatroom.findAll();

    res.status(200).json({
      success: true,
      data: chatrooms,
    });
  } catch (error) {
    next(error);
  }
};

export const getChatroomById = (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { roomId } = req.params;
    const chatroom = Chatroom.findById(roomId);

    if (!chatroom) {
      res.status(404).json({
        success: false,
        error: 'Chatroom not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: chatroom,
    });
  } catch (error) {
    next(error);
  }
};

export const joinChatroom = (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { roomId } = req.params;
    const userId = req.user!.userId;

    Chatroom.joinRoom(roomId, userId);

    logger.info(`User ${userId} joined chatroom ${roomId}`);

    res.status(200).json({
      success: true,
      message: 'Joined chatroom successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const leaveChatroom = (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { roomId } = req.params;
    const userId = req.user!.userId;

    Chatroom.leaveRoom(roomId, userId);

    logger.info(`User ${userId} left chatroom ${roomId}`);

    res.status(200).json({
      success: true,
      message: 'Left chatroom successfully',
    });
  } catch (error) {
    next(error);
  }
};