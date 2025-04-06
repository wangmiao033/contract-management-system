import mongoose from 'mongoose';
import { IContract } from '../types/express';

const contractSchema = new mongoose.Schema<IContract>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  contractNumber: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['purchase', 'sales', 'service', 'employment', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'signed', 'expired', 'terminated'],
    default: 'draft'
  },
  parties: [{
    name: String,
    role: String,
    contact: String,
    email: String
  }],
  content: {
    type: String,
    required: true
  },
  attachments: [{
    name: String,
    path: String,
    size: Number,
    uploadDate: Date
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  value: {
    amount: Number,
    currency: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    comment: String,
    date: Date
  }],
  signatures: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: Date,
    signature: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export const Contract = mongoose.model<IContract>('Contract', contractSchema); 