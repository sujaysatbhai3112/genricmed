import mongoose, { Schema, Document } from 'mongoose';

// ─── Generic Alternative sub-document ────────────────────────────────────────
export interface IGenericAlternative {
  _id: mongoose.Types.ObjectId;
  name: string;
  manufacturer: string;
  price: number;
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
  status: 'active' | 'inactive';
  mappingStatus: 'approved' | 'pending' | 'rejected';
  mappingEvidence?: string;
  reviewedBy?: string;
}

const GenericAlternativeSchema = new Schema<IGenericAlternative>(
  {
    name:              { type: String, required: true },
    manufacturer:      { type: String, required: true },
    price:             { type: Number, required: true },
    packSize:          { type: String, default: '' },
    dosageForm:        { type: String, default: '' },
    strength:          { type: String, default: '' },
    savingsPercentage: { type: Number, default: 0 },
    fdaApproved:       { type: Boolean, default: false },
    whoGmpCertified:   { type: Boolean, default: false },
    labTested:         { type: Boolean, default: false },
    inStock:           { type: Boolean, default: true },
    rating:            { type: Number, default: 0 },
    ratingCount:       { type: Number, default: 0 },
    deliveryEta:       { type: String, default: '' },
    status:            { type: String, enum: ['active', 'inactive'], default: 'active' },
    mappingStatus:     { type: String, enum: ['approved', 'pending', 'rejected'], default: 'approved' },
    mappingEvidence:   { type: String },
    reviewedBy:        { type: String },
  },
  { _id: true }
);

// ─── Medicine document ────────────────────────────────────────────────────────
export interface IMedicine extends Document {
  _id: mongoose.Types.ObjectId;
  legacyId: string;           // preserves the frontend string ID (e.g. "med-lipitor-20")
  brandName: string;
  brandManufacturer: string;
  brandPrice: number;
  activeIngredient: string;
  category: string;
  treatmentFor: string;
  rxRequired: boolean;
  description: string;
  dosageInstructions: string;
  commonSideEffects: string[];
  precautions: string[];
  storageAdvice: string;
  status: 'active' | 'inactive';
  suggestedGenerics: IGenericAlternative[];
  createdAt: Date;
  updatedAt: Date;
}

const MedicineSchema = new Schema<IMedicine>(
  {
    legacyId:           { type: String, required: true, unique: true, index: true },
    brandName:          { type: String, required: true, index: true },
    brandManufacturer:  { type: String, required: true },
    brandPrice:         { type: Number, required: true },
    activeIngredient:   { type: String, required: true, index: true },
    category:           { type: String, required: true, default: 'all', index: true },
    treatmentFor:       { type: String, default: '' },
    rxRequired:         { type: Boolean, default: false },
    description:        { type: String, default: '' },
    dosageInstructions: { type: String, default: '' },
    commonSideEffects:  [{ type: String }],
    precautions:        [{ type: String }],
    storageAdvice:      { type: String, default: '' },
    status:             { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    suggestedGenerics:  [GenericAlternativeSchema],
  },
  { timestamps: true }
);

// Text index for fast search
MedicineSchema.index(
  { brandName: 'text', activeIngredient: 'text', treatmentFor: 'text', brandManufacturer: 'text' },
  { name: 'medicine_text_search' }
);

export const Medicine = mongoose.model<IMedicine>('Medicine', MedicineSchema);
