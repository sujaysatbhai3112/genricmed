import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  medicineId: mongoose.Types.ObjectId;
  genericAlternativeId: mongoose.Types.ObjectId;
  brandName: string;
  genericName: string;
  activeIngredient: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  rxRequired: boolean;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    medicineId:           { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
    genericAlternativeId: { type: Schema.Types.ObjectId, required: true },
    brandName:            { type: String, required: true },
    genericName:          { type: String, required: true },
    activeIngredient:     { type: String, default: '' },
    quantity:             { type: Number, required: true, default: 1 },
    unitPrice:            { type: Number, required: true },
    totalPrice:           { type: Number, required: true },
    rxRequired:           { type: Boolean, default: false },
  },
  { _id: true }
);

export interface IDeliveryAddress {
  fullName: string;
  phone: string;
  pincode: string;
  streetAddress: string;
  city: string;
  state: string;
  addressType: string;
  deliveryNotes?: string;
}

const DeliveryAddressSchema = new Schema<IDeliveryAddress>(
  {
    fullName:      { type: String, default: '' },
    phone:         { type: String, default: '' },
    pincode:       { type: String, default: '' },
    streetAddress: { type: String, default: '' },
    city:          { type: String, default: '' },
    state:         { type: String, default: '' },
    addressType:   { type: String, default: 'home' },
    deliveryNotes: { type: String },
  },
  { _id: false }
);

export type OrderStatus =
  | 'order_placed'
  | 'rx_verified'
  | 'dispensed'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface IOrder extends Document {
  orderId: string;           // human-readable: ORD-GEN-XXXXXX
  sessionId: string;
  items: IOrderItem[];
  totalAmount: number;
  totalSaved: number;
  deliverySpeed: string;
  deliveryFee: number;
  deliveryAddress: IDeliveryAddress;
  paymentMethod: 'cod' | 'card' | 'upi';
  status: OrderStatus;
  prescriptionAttached: boolean;
  pharmacistName: string;
  licenseNumber: string;
  estimatedDeliveryTime: string;
  riderName?: string;
  riderPhone?: string;
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderId:               { type: String, required: true, unique: true, index: true },
    sessionId:             { type: String, required: true, default: 'default', index: true },
    items:                 [OrderItemSchema],
    totalAmount:           { type: Number, required: true },
    totalSaved:            { type: Number, default: 0 },
    deliverySpeed:         { type: String, default: 'standard' },
    deliveryFee:           { type: Number, default: 0 },
    deliveryAddress:       { type: DeliveryAddressSchema, default: () => ({}) },
    paymentMethod:         { type: String, enum: ['cod', 'card', 'upi'], default: 'cod' },
    status:                {
      type: String,
      enum: ['order_placed', 'rx_verified', 'dispensed', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'order_placed',
      index: true,
    },
    prescriptionAttached:  { type: Boolean, default: false },
    pharmacistName:        { type: String, default: 'Dr. Emily Vance (Pharm.D)' },
    licenseNumber:         { type: String, default: 'RPH-849204' },
    estimatedDeliveryTime: { type: String, default: '' },
    riderName:             { type: String },
    riderPhone:            { type: String },
    idempotencyKey:        { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
