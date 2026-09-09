/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Medicine, GenericAlternative } from '../types';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
  TrendingDown,
  Building,
} from 'lucide-react';

interface MedicineCardProps {
  medicine: Medicine;
  onAddToCart: (medicine: Medicine, generic: GenericAlternative, quantity: number) => void;
  onViewDetails: (medicine: Medicine) => void;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  onAddToCart,
  onViewDetails,
}) => {
  const [selectedGenericIndex, setSelectedGenericIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const currentGeneric = medicine.suggestedGenerics[selectedGenericIndex] || medicine.suggestedGenerics[0];
  const savingsAmount = medicine.brandPrice - currentGeneric.price;
  const savingsPercent = Math.round((savingsAmount / medicine.brandPrice) * 100);

  const handleAdd = () => {
    onAddToCart(medicine, currentGeneric, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <div
      id={`medicine-card-${medicine.id}`}
      className="bg-white rounded-2xl border border-zinc-200/90 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Active Salt Composition Badge Header */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/40 p-4 border-b border-emerald-100/80">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Active Pharmaceutical Ingredient (Salt)
            </div>
            <h3 className="text-base font-bold text-zinc-900 mt-0.5">
              {medicine.activeIngredient}
            </h3>
            <p className="text-xs text-zinc-600 mt-0.5">
              Indication: <span className="font-medium text-zinc-800">{medicine.treatmentFor}</span>
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
              <TrendingDown className="w-3.5 h-3.5" /> Save {savingsPercent}%
            </span>
            {medicine.rxRequired && (
              <div className="text-[10px] text-zinc-500 font-medium mt-1">
                Prescription Required
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
        {/* Comparison Grid: Branded vs Recommended Generic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Branded Medicine Column */}
          <div className="p-3 rounded-xl bg-zinc-50/80 border border-zinc-200 text-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-semibold uppercase text-zinc-400 tracking-wider">
                Original Branded Drug
              </span>
              <h4 className="text-sm font-semibold text-zinc-900 mt-0.5">
                {medicine.brandName}
              </h4>
              <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-0.5">
                <Building className="w-3 h-3" />
                <span>{medicine.brandManufacturer}</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-zinc-200 flex items-baseline justify-between">
              <span className="text-zinc-500">M.R.P. (Branded):</span>
              <span className="text-sm font-semibold text-zinc-600 line-through">
                ${medicine.brandPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Generic Substitute Column */}
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-md uppercase">
              Recommended Generic
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase text-emerald-800 tracking-wider">
                100% Bioequivalent Alternative
              </span>
              <h4 className="text-sm font-bold text-emerald-950 mt-0.5">
                {currentGeneric.name}
              </h4>
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentGeneric.manufacturer}</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-emerald-200/80 flex items-baseline justify-between">
              <span className="text-emerald-900 font-medium">Generic Price:</span>
              <div className="text-right">
                <span className="text-base font-bold text-emerald-700">
                  ${currentGeneric.price.toFixed(2)}
                </span>
                <span className="text-[10px] text-zinc-500 block">
                  {currentGeneric.packSize}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Multiple generic manufacturer switchers (if more than 1 generic exists) */}
        {medicine.suggestedGenerics.length > 1 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 text-[11px] shrink-0">Certified Lab:</span>
            <div className="flex flex-wrap gap-1.5">
              {medicine.suggestedGenerics.map((g, idx) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGenericIndex(idx)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedGenericIndex === idx
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {g.manufacturer.split(' ')[0]} (${g.price.toFixed(2)})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quality assurance badges & ETA */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 text-xs">
          <div className="flex items-center gap-2 text-[11px] text-zinc-600">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> WHO-GMP Approved
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-zinc-600">
              <Clock className="w-3.5 h-3.5 text-zinc-400" /> {currentGeneric.deliveryEta}
            </span>
          </div>

          <button
            onClick={() => onViewDetails(medicine)}
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer"
          >
            Clinical details <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Add to Delivery Cart Actions */}
        <div className="flex items-center gap-2 pt-1">
          {/* Quantity selector */}
          <div className="flex items-center border border-zinc-200 rounded-xl bg-zinc-50 overflow-hidden shrink-0">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="p-2 text-zinc-500 hover:text-zinc-800 disabled:opacity-40 cursor-pointer"
              title="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 text-center text-xs font-bold text-zinc-800">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-2 text-zinc-500 hover:text-zinc-800 cursor-pointer"
              title="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Direct Add Button */}
          <button
            id={`add-generic-btn-${medicine.id}`}
            onClick={handleAdd}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs transition-all shadow-xs cursor-pointer ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            {justAdded ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Added to Delivery Cart!
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Add Generic to Delivery (${(currentGeneric.price * quantity).toFixed(2)})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
