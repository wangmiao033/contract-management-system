import { Document } from 'mongoose';

declare module 'express' {
  interface Request {
    user?: {
      _id: string;
      role: string;
    };
  }
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: string;
  profile?: {
    fullName?: string;
    phone?: string;
    department?: string;
    position?: string;
  };
  createdAt: Date;
  lastLogin?: Date;
  status: string;
}

export interface IContract extends Document {
  title: string;
  contractNumber: string;
  type: string;
  status: string;
  parties: Array<{
    name: string;
    role: string;
    contact: string;
    email: string;
  }>;
  content: string;
  attachments: Array<{
    name: string;
    path: string;
    size: number;
    uploadDate: Date;
  }>;
  startDate: Date;
  endDate: Date;
  value?: {
    amount: number;
    currency: string;
  };
  createdBy: string;
  approvers: Array<{
    user: string;
    status: string;
    comment?: string;
    date?: Date;
  }>;
  signatures: Array<{
    user: string;
    date: Date;
    signature: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
} 