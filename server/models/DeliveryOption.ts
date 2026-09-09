import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliveryOption extends Document {
  optionId: string;   // 'express' | 'same-day' | 'standard'
  name: string;
  estimatedTime: string;
  price: number;
  badge?: string;
  isActive: boolean;
  sortOrder: number;
}

const DeliveryOptionSchema = new Schema<IDeliveryOption>(
  {
    optionId:      { type: String, required: true, unique: true },
    name:          { type: String, required: true },
    estimatedTime: { type: String, required: true },
    price:         { type: Number, default: 0 },
    badge:         { type: String },
    isActive:      { type: Boolean, default: true },
    sortOrder:     { type: Number, default: 0 },
  },
  { timestamps: false }
);

export const DeliveryOption = mongoose.model<IDeliveryOption>('DeliveryOption', DeliveryOptionSchema);
