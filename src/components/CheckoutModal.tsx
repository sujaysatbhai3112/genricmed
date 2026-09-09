/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CartItem, DeliveryAddress, DeliverySpeed, Order } from '../types';
import { deliveryOptions } from '../data/medicineDatabase';
import {
  X,
  MapPin,
  Truck,
  FileCheck,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  Clock,
  Sparkles,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  deliveryPincode: string;
  onOrderPlaced: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  deliveryPincode,
  onOrderPlaced,
}) => {
  const [address, setAddress] = useState<DeliveryAddress>({
    fullName: 'Robert Miller',
    phone: '+1 (555) 438-9201',
    pincode: deliveryPincode,
    streetAddress: '742 Evergreen Terrace, Apt 4B',
    city: 'Springfield',
    state: 'NY',
    addressType: 'home',
    deliveryNotes: 'Please ring bell 4B or leave with doorman.',
  });

  const [selectedSpeed, setSelectedSpeed] = useState<DeliverySpeed>('express');
  const [rxOption, setRxOption] = useState<'upload' | 'pharmacist_call' | 'not_needed'>('upload');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'upi'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce(
    (acc, curr) => acc + curr.genericAlternative.price * curr.quantity,
    0
  );

  const selectedDeliveryOption =
    deliveryOptions.find((d) => d.id === selectedSpeed) || deliveryOptions[0];

  const deliveryFee = subtotal > 25 && selectedSpeed === 'standard' ? 0 : selectedDeliveryOption.price;
  const grandTotal = subtotal + deliveryFee;

  // Approximate branded baseline to calculate exact savings
  const estimatedBrandedPrice = items.reduce((acc, curr) => {
    const pct = curr.genericAlternative.savingsPercentage || 80;
    const baseBrand = curr.genericAlternative.price / (1 - pct / 100);
    return acc + baseBrand * curr.quantity;
  }, 0);

  const totalSavings = Math.max(0, estimatedBrandedPrice - subtotal);
  const requiresRx = items.some((item) => item.rxRequired);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      const newOrder: Order = {
        id: `ORD-GEN-${Math.floor(Math.random() * 899999 + 100000)}`,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        items: [...items],
        totalAmount: grandTotal,
        totalSaved: totalSavings,
        deliverySpeed: selectedSpeed,
        deliveryFee,
        deliveryAddress: address,
        paymentMethod,
        status: 'order_placed',
        prescriptionAttached: rxOption === 'upload',
        pharmacistName: 'Dr. Emily Vance (Pharm.D)',
        licenseNumber: 'RPH-849204',
        estimatedDeliveryTime:
          selectedSpeed === 'express'
            ? 'Today in 45-60 minutes'
            : selectedSpeed === 'same-day'
            ? 'Today by 8:00 PM'
            : 'Tomorrow afternoon',
        riderName: 'Carlos Ramirez',
        riderPhone: '+1 (555) 902-1144',
      };

      onOrderPlaced(newOrder);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-zinc-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
          <div>
            <h2 className="text-base font-bold text-zinc-900">
              Confirm Generic Medicine Doorstep Delivery
            </h2>
            <p className="text-xs text-zinc-500">
              Deliver to {deliveryPincode} • Licensed Pharmacist Dispensed
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handlePlaceOrder} className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Section 1: Delivery Address */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              1. Delivery Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-zinc-600 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-medium mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-600 font-medium mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={address.streetAddress}
                  onChange={(e) => setAddress({ ...address, streetAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-medium mb-1">City</label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-medium mb-1">Postal / Zip Code</label>
                <input
                  type="text"
                  required
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-600 font-medium mb-1">
                  Delivery Notes / Gate Code
                </label>
                <input
                  type="text"
                  value={address.deliveryNotes || ''}
                  onChange={(e) => setAddress({ ...address, deliveryNotes: e.target.value })}
                  placeholder="e.g. Leave at door, call when arrived"
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Speed */}
          <div className="space-y-3 pt-4 border-t border-zinc-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-600" />
              2. Select Delivery Speed
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {deliveryOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setSelectedSpeed(opt.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedSpeed === opt.id
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-900">
                    <span>{opt.name}</span>
                    <span>${opt.price.toFixed(2)}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    <span>{opt.estimatedTime}</span>
                  </div>
                  {opt.badge && (
                    <span className="inline-block mt-2 text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                      {opt.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Prescription Verification */}
          {requiresRx && (
            <div className="space-y-3 pt-4 border-t border-zinc-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                3. Prescription Verification (Mandatory for Rx Generics)
              </h3>

              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-emerald-50/30 cursor-pointer">
                  <input
                    type="radio"
                    name="rxOption"
                    checked={rxOption === 'upload'}
                    onChange={() => setRxOption('upload')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="text-xs">
                    <strong className="text-zinc-900 block">
                      Prescription is attached / already uploaded
                    </strong>
                    <span className="text-zinc-500 text-[11px]">
                      Our pharmacist will verify the active salt and dosage within 10 minutes.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-emerald-50/30 cursor-pointer">
                  <input
                    type="radio"
                    name="rxOption"
                    checked={rxOption === 'pharmacist_call'}
                    onChange={() => setRxOption('pharmacist_call')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="text-xs">
                    <strong className="text-zinc-900 block">
                      Request Free Call from Registered Pharmacist
                    </strong>
                    <span className="text-zinc-500 text-[11px]">
                      Our clinical team will call you to discuss your dosage and assist with Rx verification.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Section 4: Payment Method */}
          <div className="space-y-3 pt-4 border-t border-zinc-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              4. Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <label className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer ${
                paymentMethod === 'cod' ? 'border-emerald-600 bg-emerald-50/60 font-bold text-emerald-950' : 'border-zinc-200'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="text-emerald-600"
                />
                <span>Cash on Delivery (COD)</span>
              </label>

              <label className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer ${
                paymentMethod === 'card' ? 'border-emerald-600 bg-emerald-50/60 font-bold text-emerald-950' : 'border-zinc-200'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="text-emerald-600"
                />
                <span>Credit / Debit Card</span>
              </label>

              <label className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer ${
                paymentMethod === 'upi' ? 'border-emerald-600 bg-emerald-50/60 font-bold text-emerald-950' : 'border-zinc-200'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                  className="text-emerald-600"
                />
                <span>UPI / Digital Wallet</span>
              </label>
            </div>
          </div>

          {/* Pricing & Savings Summary Card */}
          <div className="p-4 rounded-xl bg-zinc-900 text-white space-y-2 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Items Total (Generic Pricing):</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Delivery Charges ({selectedDeliveryOption.name}):</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-semibold text-xs pt-1 border-t border-zinc-800">
              <span>Total Price Difference Saved:</span>
              <span>-${totalSavings.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-base pt-1 border-t border-zinc-800">
              <span>Final Amount to Pay:</span>
              <span className="text-emerald-400">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Confirming Order & Assigning Pharmacist...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Place Generic Medicine Order (${grandTotal.toFixed(2)})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
