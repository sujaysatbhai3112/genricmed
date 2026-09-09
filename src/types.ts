/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GenericAlternative {
  id: string;
  name: string;
  manufacturer: string;
  price: number;
  packSize: string; // e.g. "Strip of 10 tablets"
  dosageForm: string; // "Tablet", "Capsule", "Syrup", etc.
  strength: string; // "20mg", "650mg"
  savingsPercentage: number; // e.g. 78%
  fdaApproved: boolean;
  whoGmpCertified: boolean;
  labTested: boolean;
  inStock: boolean;
  rating: number;
  ratingCount: number;
  deliveryEta: string; // "Today in 2 hrs" or "Tomorrow by 11 AM"
}

export interface Medicine {
  id: string;
  brandName: string;
  brandManufacturer: string;
  brandPrice: number;
  activeIngredient: string; // Active salt composition, e.g., "Atorvastatin Calcium"
  category: MedicineCategory;
  treatmentFor: string; // "High Cholesterol & Cardiovascular Health"
  rxRequired: boolean; // Requires doctor's prescription
  description: string;
  dosageInstructions: string;
  commonSideEffects: string[];
  precautions: string[];
  storageAdvice: string;
  suggestedGenerics: GenericAlternative[];
}

export type MedicineCategory =
  | 'all'
  | 'heart-bp'
  | 'diabetes'
  | 'pain-fever'
  | 'antibiotics'
  | 'stomach-acidity'
  | 'allergy-cold'
  | 'vitamins-immunity'
  | 'mental-wellness';

export interface CartItem {
  id: string;
  medicineId: string;
  brandName: string;
  genericAlternative: GenericAlternative;
  activeIngredient: string;
  quantity: number;
  rxRequired: boolean;
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  pincode: string;
  streetAddress: string;
  city: string;
  state: string;
  addressType: 'home' | 'work' | 'other';
  deliveryNotes?: string;
}

export type DeliverySpeed = 'express' | 'same-day' | 'standard';

export interface DeliveryOption {
  id: DeliverySpeed;
  name: string;
  estimatedTime: string;
  price: number;
  badge?: string;
}

export type OrderStatus =
  | 'order_placed'
  | 'rx_verified'
  | 'dispensed'
  | 'out_for_delivery'
  | 'delivered';

export interface OrderTrackingStep {
  status: OrderStatus;
  label: string;
  timestamp: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface Order {
  id: string;
  createdAt: string;
  items: CartItem[];
  totalAmount: number;
  totalSaved: number;
  deliverySpeed: DeliverySpeed;
  deliveryFee: number;
  deliveryAddress: DeliveryAddress;
  paymentMethod: 'cod' | 'card' | 'upi';
  status: OrderStatus;
  prescriptionAttached: boolean;
  pharmacistName: string;
  licenseNumber: string;
  estimatedDeliveryTime: string;
  riderName?: string;
  riderPhone?: string;
}

export interface PrescriptionScanResult {
  fileName: string;
  doctorName: string;
  clinicName: string;
  date: string;
  detectedMedicines: {
    prescribedBrand: string;
    matchedMedicineId?: string;
    saltDetected: string;
    recommendedGeneric: string;
    brandPrice: number;
    genericPrice: number;
    savings: number;
    selected: boolean;
  }[];
}
