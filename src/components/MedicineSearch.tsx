/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MedicineCategory } from '../types';
import {
  Heart,
  Activity,
  Flame,
  ShieldAlert,
  Wind,
  Smile,
  Zap,
  Sparkles,
  Layers,
  Filter,
} from 'lucide-react';

interface MedicineSearchProps {
  selectedCategory: MedicineCategory;
  onSelectCategory: (cat: MedicineCategory) => void;
  searchQuery: string;
  onSelectSuggestedBrand: (brand: string) => void;
  filterRxOnly: boolean;
  onToggleFilterRxOnly: () => void;
  sortBy: 'savings' | 'price-asc' | 'rating';
  onSortChange: (sort: 'savings' | 'price-asc' | 'rating') => void;
  totalResults: number;
}

const categories: { id: MedicineCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All Categories', icon: <Layers className="w-3.5 h-3.5" /> },
  { id: 'heart-bp', label: 'Heart & BP', icon: <Heart className="w-3.5 h-3.5" /> },
  { id: 'diabetes', label: 'Diabetes Care', icon: <Activity className="w-3.5 h-3.5" /> },
  { id: 'pain-fever', label: 'Pain & Fever', icon: <Flame className="w-3.5 h-3.5" /> },
  { id: 'antibiotics', label: 'Antibiotics', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
  { id: 'stomach-acidity', label: 'Acid Reflux / Digestion', icon: <Zap className="w-3.5 h-3.5" /> },
  { id: 'allergy-cold', label: 'Allergy & Cold', icon: <Wind className="w-3.5 h-3.5" /> },
  { id: 'vitamins-immunity', label: 'Vitamins & Minerals', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'mental-wellness', label: 'Mental Wellness', icon: <Smile className="w-3.5 h-3.5" /> },
];

const popularSearches = [
  'Lipitor',
  'Augmentin',
  'Glucophage',
  'Crocin / Panadol',
  'Nexium',
  'Norvasc',
  'Allegra',
  'Zoloft',
  'Shelcal',
];

export const MedicineSearch: React.FC<MedicineSearchProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSelectSuggestedBrand,
  filterRxOnly,
  onToggleFilterRxOnly,
  sortBy,
  onSortChange,
  totalResults,
}) => {
  return (
    <div className="space-y-4">
      {/* Popular Search Suggestion Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <span className="text-xs font-semibold text-zinc-500 shrink-0">Popular:</span>
        {popularSearches.map((brand) => (
          <button
            key={brand}
            onClick={() => onSelectSuggestedBrand(brand)}
            className="px-2.5 py-1 rounded-full text-xs bg-zinc-100 hover:bg-emerald-50 hover:text-emerald-700 text-zinc-700 font-medium transition-colors shrink-0 cursor-pointer border border-zinc-200/60"
          >
            {brand}
          </button>
        ))}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-zinc-700 border border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter and Sorting bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-zinc-500 font-medium">
            Showing <strong className="text-zinc-900">{totalResults}</strong> generic alternatives
          </span>

          {searchQuery && (
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded-md">
              Matching &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Rx Filter checkbox toggle */}
          <label className="flex items-center gap-1.5 text-zinc-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filterRxOnly}
              onChange={onToggleFilterRxOnly}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <span>Prescription medicines only</span>
          </label>

          {/* Sort dropdown */}
          <div className="flex items-center gap-1.5 text-zinc-600">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as 'savings' | 'price-asc' | 'rating')}
              className="bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs text-zinc-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="savings">Highest Savings (%)</option>
              <option value="price-asc">Lowest Price ($)</option>
              <option value="rating">Top Pharmacist Rated</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
