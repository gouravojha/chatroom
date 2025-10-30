import { Response, NextFunction } from 'express';
import { Message } from '../models/Message';
import { IAuthRequest } from '../types';

export const getMessages = (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { roomId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    const messages = Message.getByRoomId(roomId, limit);

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};