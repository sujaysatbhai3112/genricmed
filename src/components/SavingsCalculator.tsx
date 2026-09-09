/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { medicineDatabase } from '../data/medicineDatabase';
import { Medicine, GenericAlternative } from '../types';
import {
  Calculator,
  TrendingDown,
  DollarSign,
  Calendar,
  Sparkles,
  Plus,
  Minus,
  CheckCircle2,
  ShoppingCart,
  Pill,
} from 'lucide-react';

interface SavingsCalculatorProps {
  onAddMultipleToCart: (
    items: { medicine: Medicine; generic: GenericAlternative; quantity: number }[]
  ) => void;
}

export const SavingsCalculator: React.FC<SavingsCalculatorProps> = ({
  onAddMultipleToCart,
}) => {
  // Chronic medicines available for calculation
  const chronicMeds = medicineDatabase.filter((m) =>
    ['heart-bp', 'diabetes', 'stomach-acidity', 'mental-wellness'].includes(m.category)
  );

  // Selected meds state: map medicine id to monthly strip count (usually 1, 2 or 3)
  const [selectedMeds, setSelectedMeds] = useState<Record<string, number>>({
    'med-lipitor-20': 1,
    'med-glucophage-500': 2,
    'med-norvasc-5': 1,
    'med-nexium-40': 1,
  });

  const [refillDuration, setRefillDuration] = useState<30 | 90>(30);
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  const toggleMed = (id: string) => {
    setSelectedMeds((prev) => {
      const copy = { ...prev };
      if (copy[id]) {
        delete copy[id];
      } else {
        copy[id] = 1;
      }
      return copy;
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setSelectedMeds((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(1, current + delta);
      return { ...prev, [id]: next };
    });
  };

  // Compute monthly totals
  let monthlyBrandTotal = 0;
  let monthlyGenericTotal = 0;

  Object.entries(selectedMeds).forEach(([id, rawQty]) => {
    const qty = Number(rawQty) || 1;
    const med = medicineDatabase.find((m) => m.id === id);
    if (med && med.suggestedGenerics[0]) {
      monthlyBrandTotal += med.brandPrice * qty;
      monthlyGenericTotal += med.suggestedGenerics[0].price * qty;
    }
  });

  const monthlySavings = monthlyBrandTotal - monthlyGenericTotal;
  const multiplier = refillDuration === 90 ? 3 : 1;
  const periodBrandTotal = monthlyBrandTotal * multiplier;
  const periodGenericTotal = monthlyGenericTotal * multiplier;
  const periodSavings = monthlySavings * multiplier;

  const annualSavings = monthlySavings * 12;
  const fiveYearSavings = annualSavings * 5;

  const handleOrderGenericRefill = () => {
    const itemsToAdd: { medicine: Medicine; generic: GenericAlternative; quantity: number }[] = [];

    Object.entries(selectedMeds).forEach(([id, rawQty]) => {
      const qty = Number(rawQty) || 1;
      const med = medicineDatabase.find((m) => m.id === id);
      if (med && med.suggestedGenerics[0]) {
        itemsToAdd.push({
          medicine: med,
          generic: med.suggestedGenerics[0],
          quantity: qty * multiplier,
        });
      }
    });

    onAddMultipleToCart(itemsToAdd);
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-700/80 text-emerald-100 border border-emerald-600/50 mb-3">
            <Calculator className="w-3.5 h-3.5 text-emerald-300" /> Chronic Care Cost Analyzer
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Calculate Your Annual Healthcare Savings
          </h2>
          <p className="text-emerald-100 text-sm mt-2 leading-relaxed">
            See exactly how much your household saves every month and year by substituting routine
            branded chronic care medications with certified, bioequivalent generic alternatives.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Select Chronic Medications */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-600" />
                Select Your Regular Ongoing Medicines
              </h3>
              <span className="text-xs text-zinc-500">
                {Object.keys(selectedMeds).length} selected
              </span>
            </div>

            <div className="divide-y divide-zinc-100 mt-3">
              {chronicMeds.map((med) => {
                const isSelected = !!selectedMeds[med.id];
                const qty = selectedMeds[med.id] || 1;
                const generic = med.suggestedGenerics[0];
                const savingsPerMonth = (med.brandPrice - generic.price) * qty;

                return (
                  <div
                    key={med.id}
                    className={`py-3.5 px-3 rounded-xl transition-all flex items-center justify-between gap-3 ${
                      isSelected ? 'bg-emerald-50/40' : 'hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleMed(med.id)}
                        className="mt-1 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-zinc-900">{med.brandName}</span>
                          <span className="text-[10px] text-zinc-400">➔</span>
                          <span className="text-xs font-semibold text-emerald-700">
                            {generic.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                          Active Salt: {med.activeIngredient}
                        </p>
                        <div className="text-[11px] text-zinc-600 mt-1">
                          Brand: <span className="line-through text-zinc-400">${med.brandPrice.toFixed(2)}</span>
                          {' | '}
                          Generic: <strong className="text-emerald-700">${generic.price.toFixed(2)}</strong>
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-700 block">
                            Save ${savingsPerMonth.toFixed(2)}/mo
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {qty} pack{qty > 1 ? 's' : ''}/month
                          </span>
                        </div>

                        <div className="flex items-center border border-zinc-200 rounded-lg bg-white">
                          <button
                            onClick={() => updateQuantity(med.id, -1)}
                            className="px-2 py-1 text-xs text-zinc-500 hover:text-zinc-800 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-zinc-800">
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQuantity(med.id, 1)}
                            className="px-2 py-1 text-xs text-zinc-500 hover:text-zinc-800 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Projected Savings Dashboard */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-zinc-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase text-emerald-400 tracking-wider">
                Total Projected Savings
              </span>
              <div className="flex items-center bg-zinc-800 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setRefillDuration(30)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    refillDuration === 30 ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  30 Days
                </button>
                <button
                  onClick={() => setRefillDuration(90)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    refillDuration === 90 ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  90 Days
                </button>
              </div>
            </div>

            {/* Big Headline Savings Number */}
            <div className="my-5">
              <div className="text-xs text-zinc-400 mb-1">
                {refillDuration}-Day Generic Medicine Savings:
              </div>
              <div className="text-4xl sm:text-5xl font-extrabold text-emerald-400 tracking-tight flex items-baseline gap-1">
                <span>${periodSavings.toFixed(2)}</span>
                <span className="text-xs font-medium text-emerald-300">
                  ({monthlyBrandTotal > 0 ? Math.round((monthlySavings / monthlyBrandTotal) * 100) : 0}% saved)
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-zinc-800 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Total Branded Cost:</span>
                <span className="line-through">${periodBrandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Generic Medicine Cost:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  ${periodGenericTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Long-term Cumulative Outlook */}
            <div className="mt-6 p-4 rounded-xl bg-zinc-800/80 border border-zinc-700/60 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  1-Year Annual Savings:
                </span>
                <span className="font-bold text-emerald-300 text-sm">
                  ${annualSavings.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5 text-teal-400" />
                  5-Year Cumulative Savings:
                </span>
                <span className="font-bold text-teal-300 text-sm">
                  ${fiveYearSavings.toFixed(2)}
                </span>
              </div>
            </div>

            {/* 1-Click Refill Order CTA */}
            <button
              onClick={handleOrderGenericRefill}
              disabled={Object.keys(selectedMeds).length === 0}
              className={`w-full mt-6 py-3.5 px-4 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                isAddedToCart
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 disabled:opacity-40'
              }`}
            >
              {isAddedToCart ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Added {refillDuration}-Day Refill to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" /> Order {refillDuration}-Day Generic Pack (${periodGenericTotal.toFixed(2)})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
