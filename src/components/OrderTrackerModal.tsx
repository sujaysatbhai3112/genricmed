/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { cancelOrder } from '../api';
import {
  CheckCircle2,
  Truck,
  ShieldCheck,
  ChevronRight,
  XCircle,
  RefreshCw,
} from 'lucide-react';

interface OrderTrackerModalProps {
  order: Order | null;
  allOrders: Order[];
  onSelectOrder: (order: Order) => void;
  onClose: () => void;
  onAdvanceStatus: (orderId: string) => void;
  onRefresh: () => Promise<void>;
}

const statusFlow: { status: OrderStatus; label: string; desc: string }[] = [
  {
    status: 'order_placed',
    label: 'Order Placed',
    desc: 'Received by digital pharmacy routing system.',
  },
  {
    status: 'rx_verified',
    label: 'Rx Verified by Pharmacist',
    desc: 'Active salt bioequivalence & dosage approved.',
  },
  {
    status: 'dispensed',
    label: 'Dispensed & Tamper-Sealed',
    desc: 'Packed in temperature-monitored medical container.',
  },
  {
    status: 'out_for_delivery',
    label: 'Out for Express Delivery',
    desc: 'Delivery runner is en-route to your address.',
  },
  {
    status: 'delivered',
    label: 'Delivered to Doorstep',
    desc: 'Successfully handed over with signature verification.',
  },
];

export const OrderTrackerView: React.FC<OrderTrackerModalProps> = ({
  order,
  allOrders,
  onSelectOrder,
  onClose,
  onAdvanceStatus,
  onRefresh,
}) => {
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleCancel = async (orderId: string) => {
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(orderId);
    setCancelError(null);
    try {
      await cancelOrder(orderId);
      await onRefresh();
    } catch (err: any) {
      setCancelError(err?.message ?? 'Failed to cancel order');
    } finally {
      setCancelling(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh().catch(() => {});
    setRefreshing(false);
  };

  if (allOrders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center space-y-4 max-w-xl mx-auto my-8">
        <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto">
          <Truck className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-zinc-900">No Orders Placed Yet</h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          When you place a generic medicine order, you can track the real-time pharmacist verification,
          temperature-controlled packaging, and doorstep delivery courier here.
        </p>
      </div>
    );
  }

  const activeOrder = order || allOrders[0];
  const currentStatusIndex = statusFlow.findIndex((s) => s.status === activeOrder.status);

  return (
    <div className="space-y-6">
      {/* Active Order Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-700/80 text-emerald-100 border border-emerald-600/50 mb-2">
              <Truck className="w-3.5 h-3.5 text-amber-300" /> Live Doorstep Delivery Tracking
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Order #{activeOrder.id}</h2>
            <p className="text-xs text-emerald-200 mt-1">
              Estimated Delivery: <strong>{activeOrder.estimatedDeliveryTime}</strong> • Deliver to{' '}
              {activeOrder.deliveryAddress.streetAddress}, {activeOrder.deliveryAddress.city}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
              title="Refresh order status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {activeOrder.status !== 'delivered' && activeOrder.status !== 'cancelled' && (
              <button
                onClick={() => onAdvanceStatus(activeOrder.id)}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                title="Advance delivery pipeline for demonstration"
              >
                <span>Simulate Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {['order_placed', 'rx_verified', 'dispensed'].includes(activeOrder.status) && (
              <button
                onClick={() => handleCancel(activeOrder.id)}
                disabled={cancelling === activeOrder.id}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{cancelling === activeOrder.id ? 'Cancelling…' : 'Cancel Order'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Stepper Timeline */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-zinc-900 mb-6 flex items-center justify-between">
              <span>Delivery Status Timeline</span>
              <span className={`text-xs font-normal px-2 py-0.5 rounded-md ${
                activeOrder.status === 'cancelled'
                  ? 'text-rose-700 bg-rose-50'
                  : 'text-emerald-700 bg-emerald-50'
              }`}>
                {activeOrder.status === 'cancelled' ? 'CANCELLED' : `Active: ${activeOrder.deliverySpeed.toUpperCase()}`}
              </span>
            </h3>

            {cancelError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{cancelError}</span>
              </div>
            )}

            <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
              {statusFlow.map((step, idx) => {
                const isDone = idx <= currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;

                return (
                  <div key={step.status} className="relative group">
                    {/* Circle Node */}
                    <div
                      className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                        isDone
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white border-zinc-300 text-zinc-300'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                      )}
                    </div>

                    <div className="ml-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold ${
                            isCurrent
                              ? 'text-emerald-800'
                              : isDone
                              ? 'text-zinc-900'
                              : 'text-zinc-400'
                          }`}
                        >
                          {step.label}
                        </span>
                        {isCurrent && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-sm animate-pulse">
                            IN PROGRESS
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pharmacist & Rider Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 pt-6 border-t border-zinc-100 text-xs">
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase text-zinc-400 font-semibold block">
                      Verifying Pharmacist
                    </span>
                    <strong className="text-zinc-900">{activeOrder.pharmacistName}</strong>
                    <span className="text-[10px] text-zinc-500 block">
                      Lic. {activeOrder.licenseNumber}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase text-zinc-400 font-semibold block">
                      Assigned Delivery Runner
                    </span>
                    <strong className="text-zinc-900">{activeOrder.riderName}</strong>
                    <span className="text-[10px] text-zinc-500 block">
                      Contact: {activeOrder.riderPhone}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Bill Breakdown & Past Order Selector */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-3">
              Medicines in Delivery ({activeOrder.items.length})
            </h3>

            <div className="space-y-2.5 max-h-60 overflow-y-auto divide-y divide-zinc-100">
              {activeOrder.items.map((item) => (
                <div key={item.id} className="pt-2 first:pt-0 flex items-start justify-between text-xs">
                  <div>
                    <strong className="text-zinc-900 block">{item.genericAlternative.name}</strong>
                    <span className="text-[11px] text-zinc-500">
                      Salt: {item.activeIngredient} (Qty: {item.quantity})
                    </span>
                    <span className="text-[10px] text-emerald-700 block">
                      Substituted for: {item.brandName}
                    </span>
                  </div>
                  <div className="text-right font-semibold text-zinc-800 shrink-0">
                    ${(item.genericAlternative.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Savings & Total Summary */}
            <div className="mt-4 pt-3 border-t border-zinc-200 space-y-1.5 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span>Total Delivery Charges:</span>
                <span>${activeOrder.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Savings on Generic Substitutes:</span>
                <span>-${activeOrder.totalSaved.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-zinc-900 pt-2 border-t border-zinc-100">
                <span>Total Paid ({activeOrder.paymentMethod.toUpperCase()}):</span>
                <span className="text-emerald-700">${activeOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Past Orders List (if multiple) */}
          {allOrders.length > 1 && (
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-3">
                Previous Orders
              </h3>
              <div className="space-y-2">
                {allOrders.map((ord) => (
                  <button
                    key={ord.id}
                    onClick={() => onSelectOrder(ord)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                      ord.id === activeOrder.id
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-zinc-900">#{ord.id}</span>
                      <span className="text-[11px] text-zinc-500 block">
                        {ord.items.length} items • ${ord.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded capitalize">
                      {ord.status.replace('_', ' ')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
