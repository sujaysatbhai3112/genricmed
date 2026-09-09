/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CartItem } from '../types';
import {
  X,
  Plus,
  Minus,
  Trash2,
  TrendingDown,
  ShieldCheck,
  Truck,
  ArrowRight,
  ShoppingBag,
  FileCheck,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  onNavigateToPrescription: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  onNavigateToPrescription,
}) => {
  if (!isOpen) return null;

  const totalGenericPrice = items.reduce(
    (acc, curr) => acc + curr.genericAlternative.price * curr.quantity,
    0
  );

  // Approximate branded baseline to calculate exact savings
  // Let's assume generic is ~15-20% of branded price
  const estimatedBrandedPrice = items.reduce((acc, curr) => {
    // If we have savings percentage, derive branded price
    const pct = curr.genericAlternative.savingsPercentage || 80;
    const baseBrand = curr.genericAlternative.price / (1 - pct / 100);
    return acc + baseBrand * curr.quantity;
  }, 0);

  const totalSavings = Math.max(0, estimatedBrandedPrice - totalGenericPrice);
  const rxRequiredItems = items.filter((item) => item.rxRequired);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-700" />
              <div>
                <h2 className="text-base font-bold text-zinc-900">
                  Your Delivery Cart ({items.reduce((acc, i) => acc + i.quantity, 0)})
                </h2>
                <p className="text-[11px] text-zinc-500">
                  Certified Bioequivalent Generic Medicines
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-200/60 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-zinc-100">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-zinc-800">Your delivery cart is empty</h3>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  Search for your prescribed branded medications to find and add certified generic substitutes.
                </p>
              </div>
            ) : (
              <>
                {/* Savings Callout Banner */}
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      You are saving <strong>${totalSavings.toFixed(2)}</strong> on this order!
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded">
                    ~{Math.round((totalSavings / estimatedBrandedPrice) * 100)}% Off
                  </span>
                </div>

                {/* Rx Warning if prescription drugs present */}
                {rxRequiredItems.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                    <FileCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Doctor&apos;s Prescription Needed</p>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        {rxRequiredItems.length} item(s) require a prescription. You can upload it during checkout or request a free pharmacist verification call.
                      </p>
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-3 pt-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-zinc-200/80 bg-zinc-50/40 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-medium text-zinc-400">
                            Substitute for: {item.brandName}
                          </span>
                          <h4 className="text-xs font-bold text-zinc-900">
                            {item.genericAlternative.name}
                          </h4>
                          <p className="text-[11px] text-emerald-700 font-medium">
                            {item.activeIngredient}
                          </p>
                          <p className="text-[10px] text-zinc-400">
                            {item.genericAlternative.packSize} • {item.genericAlternative.manufacturer}
                          </p>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-zinc-400 hover:text-rose-600 p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                        {/* Quantity Controller */}
                        <div className="flex items-center border border-zinc-200 rounded-lg bg-white">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="px-2 py-1 text-xs text-zinc-600 hover:text-zinc-900 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-zinc-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="px-2 py-1 text-xs text-zinc-600 hover:text-zinc-900 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-700">
                            ${(item.genericAlternative.price * item.quantity).toFixed(2)}
                          </span>
                          <span className="text-[10px] text-zinc-400 block line-through">
                            $
                            {(
                              (item.genericAlternative.price /
                                (1 - item.genericAlternative.savingsPercentage / 100)) *
                              item.quantity
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer & Checkout Button */}
          {items.length > 0 && (
            <div className="p-5 border-t border-zinc-200 bg-zinc-50/80 space-y-3">
              <div className="space-y-1.5 text-xs text-zinc-600">
                <div className="flex justify-between">
                  <span>Estimated Branded Price:</span>
                  <span className="line-through text-zinc-400">
                    ${estimatedBrandedPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-medium text-zinc-900">
                  <span>Generic Medicine Subtotal:</span>
                  <span className="text-emerald-700 font-bold">
                    ${totalGenericPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-700 font-semibold">
                  <span>Total Savings:</span>
                  <span>-${totalSavings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-zinc-500">
                  <span>Delivery Fee:</span>
                  <span>Calculated at checkout (Free on $20+)</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="cart-proceed-checkout-btn"
                  onClick={onProceedToCheckout}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Doorstep Delivery</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center text-[10px] text-zinc-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Genuine, Sealed Generic Medicines</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
