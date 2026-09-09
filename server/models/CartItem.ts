import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem extends Document {
  sessionId: string;
  medicineId: mongoose.Types.ObjectId;
  genericAlternativeId: mongoose.Types.ObjectId;
  // Snapshot fields so cart display works without extra joins
  brandName: string;
  activeIngredient: string;
  rxRequired: boolean;
  genericName: string;
  genericManufacturer: string;
  genericPrice: number;
  packSize: string;
  dosageForm: string;
  strength: string;
  savingsPercentage: number;
  fdaApproved: boolean;
  whoGmpCertified: boolean;
  labTested: boolean;
  inStock: boolean;
  rating: number;
  ratingCount: number;
  deliveryEta: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    sessionId:            { type: String, required: true, default: 'default', index: true },
    medicineId:           { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
    genericAlternativeId: { type: Schema.Types.ObjectId, required: true },
    brandName:            { type: String, required: true },
    activeIngredient:     { type: String, default: '' },
    rxRequired:           { type: Boolean, default: false },
    genericName:          { type: String, default: '' },
    genericManufacturer:  { type: String, default: '' },
    genericPrice:         { type: Number, default: 0 },
    packSize:             { type: String, default: '' },
    dosageForm:           { type: String, default: '' },
    strength:             { type: String, default: '' },
    savingsPercentage:    { type: Number, default: 0 },
    fdaApproved:          { type: Boolean, default: false },
    whoGmpCertified:      { type: Boolean, default: false },
    labTested:            { type: Boolean, default: false },
    inStock:              { type: Boolean, default: true },
    rating:               { type: Number, default: 0 },
    ratingCount:          { type: Number, default: 0 },
    deliveryEta:          { type: String, default: '' },
    quantity:             { type: Number, required: true, default: 1, min: 1 },
  },
  { timestamps: true }
);

export const CartItem = mongoose.model<ICartItem>('CartItem', CartItemSchema);
