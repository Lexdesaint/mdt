import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    user_id: string;
    email: string;
    [key: string]: any;
  };
}