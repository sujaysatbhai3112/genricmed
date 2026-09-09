import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditEvent extends Document {
  actorId: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

const AuditEventSchema = new Schema<IAuditEvent>(
  {
    actorId:    { type: String, default: 'system' },
    actorRole:  { type: String, default: 'system' },
    action:     { type: String, required: true, index: true },
    targetType: { type: String, required: true, index: true },
    targetId:   { type: String, required: true, index: true },
    details:    { type: Schema.Types.Mixed, default: {} },
    ipAddress:  { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const AuditEvent = mongoose.model<IAuditEvent>('AuditEvent', AuditEventSchema);
