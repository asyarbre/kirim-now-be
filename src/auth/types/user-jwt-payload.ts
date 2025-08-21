import { Request } from 'express';

export interface UserJwtPayload extends Request {
  user: {
    id: string;
    email: string;
    name: string;
    avatar: string;
    role: {
      id: string;
      name: string;
      key: string;
    };
  };
}
