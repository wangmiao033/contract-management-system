import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';

interface Party {
  name: string;
  type: string;
  contact: string;
}

interface Approver {
  user: IUser['_id'];
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  approvedAt?: Date;
}

interface Signature {
  user: IUser['_id'];
  signedAt: Date;
}

export interface IContract extends Document {
  title: string;
  contractNumber: string;
  type: string;
  content: string;
  status: 'draft' | 'pending' | 'approved' | 'signed' | 'rejected';
  startDate: Date;
  endDate: Date;
  createdBy: IUser['_id'];
  parties: Party[];
  approvers: Approver[];
  signatures: Signature[];
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

const contractSchema = new Schema<IContract>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    contractNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'signed', 'rejected'],
      default: 'draft',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    parties: [
      {
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
        contact: {
          type: String,
          required: true,
        },
      },
    ],
    approvers: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending',
        },
        comment: String,
        approvedAt: Date,
      },
    ],
    signatures: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        signedAt: {
          type: Date,
          required: true,
        },
      },
    ],
    attachments: [String],
  },
  {
    timestamps: true,
  }
);

export const Contract = mongoose.model<IContract>('Contract', contractSchema); 