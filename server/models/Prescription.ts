import mongoose, { Schema, Document } from 'mongoose';

export interface IPrescription extends Document {
  sessionId: string;
  orderId?: mongoose.Types.ObjectId;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  status: 'uploaded' | 'approved' | 'rejected' | 'clarification_needed';
  reviewNote?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionSchema = new Schema<IPrescription>(
  {
    sessionId:  { type: String, required: true, default: 'default', index: true },
    orderId:    { type: Schema.Types.ObjectId, ref: 'Order', default: null },
    fileName:   { type: String, required: true },
    filePath:   { type: String, required: true },
    fileType:   { type: String, required: true },
    fileSize:   { type: Number, default: 0 },
    status:     {
      type: String,
      enum: ['uploaded', 'approved', 'rejected', 'clarification_needed'],
      default: 'uploaded',
    },
    reviewNote: { type: String },
    reviewedBy: { type: String },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

export const Prescription = mongoose.model<IPrescription>('Prescription', PrescriptionSchema);
