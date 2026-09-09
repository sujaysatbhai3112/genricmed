/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Medicine, GenericAlternative } from '../types';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Pill,
  Building,
  Plus,
  TrendingDown,
} from 'lucide-react';

interface MedicineDetailModalProps {
  medicine: Medicine | null;
  onClose: () => void;
  onAddToCart: (medicine: Medicine, generic: GenericAlternative, quantity: number) => void;
}

export const MedicineDetailModal: React.FC<MedicineDetailModalProps> = ({
  medicine,
  onClose,
  onAddToCart,
}) => {
  if (!medicine) return null;

  const generic = medicine.suggestedGenerics[0];
  const savings = medicine.brandPrice - generic.price;
  const percent = Math.round((savings / medicine.brandPrice) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-zinc-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header with Active Salt Highlight */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-700/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-700/80 text-emerald-100 border border-emerald-600/50 mb-2">
            <Sparkles className="w-3 h-3 text-amber-300" /> Active Salt Bioequivalence Monograph
          </div>

          <h2 className="text-xl sm:text-2xl font-bold">{medicine.activeIngredient}</h2>
          <p className="text-xs text-emerald-200 mt-1">
            Branded Drug: <strong>{medicine.brandName}</strong> ({medicine.brandManufacturer})
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-zinc-700">
          {/* Bioequivalence Verification Banner */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs text-emerald-900">
                100% Therapeutically Equivalent to {medicine.brandName}
              </h4>
              <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                Generic alternative <strong>{generic.name}</strong> contains the exact same active
                chemical compound, route of administration, dosage form, strength, and therapeutic intent.
                Under regulatory bioequivalence tests, it demonstrates identical biological absorption and
                efficacy at a fraction of the cost.
              </p>
            </div>
          </div>

          {/* Pricing & Savings Side by Side */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-zinc-50 border border-zinc-200">
            <div>
              <span className="text-[10px] uppercase font-semibold text-zinc-400">
                Branded Medicine Price
              </span>
              <div className="text-lg font-bold text-zinc-500 line-through">
                ${medicine.brandPrice.toFixed(2)}
              </div>
              <span className="text-[10px] text-zinc-400">Standard Pharmacy Price</span>
            </div>

            <div className="border-l border-zinc-200 pl-4">
              <span className="text-[10px] uppercase font-semibold text-emerald-700">
                Generic Substitute Price
              </span>
              <div className="text-xl font-bold text-emerald-700">
                ${generic.price.toFixed(2)}
              </div>
              <span className="text-[10px] font-semibold text-emerald-600">
                Save ${savings.toFixed(2)} ({percent}% Off)
              </span>
            </div>
          </div>

          {/* Clinical Indication & Mechanism */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-900">
              Therapeutic Indication
            </h4>
            <p className="text-zinc-600 leading-relaxed">{medicine.treatmentFor}</p>
            <p className="text-zinc-500 text-[11px] leading-relaxed">{medicine.description}</p>
          </div>

          {/* Dosage and Administration */}
          <div className="space-y-2 pt-3 border-t border-zinc-100">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" /> Dosage & Administration Guidelines
            </h4>
            <p className="text-zinc-700 leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-200">
              {medicine.dosageInstructions}
            </p>
          </div>

          {/* Precautions and Contraindications */}
          <div className="space-y-2 pt-3 border-t border-zinc-100">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Safety Precautions & Warnings
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-zinc-600">
              {medicine.precautions.map((p, idx) => (
                <li key={idx}>{p}</li>
              ))}
            </ul>
          </div>

          {/* Common Side Effects */}
          <div className="space-y-2 pt-3 border-t border-zinc-100">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-900">
              Common Side Effects
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {medicine.commonSideEffects.map((effect, idx) => (
                <span
                  key={idx}
                  className="bg-zinc-100 text-zinc-700 px-2 py-1 rounded-md text-[11px]"
                >
                  {effect}
                </span>
              ))}
            </div>
          </div>

          {/* Storage Advisory */}
          <div className="p-3 rounded-lg bg-zinc-50 text-[11px] text-zinc-500">
            <strong>Storage Instructions:</strong> {medicine.storageAdvice}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50/80 flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-zinc-500 block">Generic Substitute:</span>
            <strong className="text-xs text-zinc-900">{generic.name}</strong>
          </div>

          <button
            onClick={() => {
              onAddToCart(medicine, generic, 1);
              onClose();
            }}
            className="py-2.5 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Generic to Cart (${generic.price.toFixed(2)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
