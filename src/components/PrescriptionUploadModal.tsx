/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { samplePrescriptions, medicineDatabase } from '../data/medicineDatabase';
import { Medicine, GenericAlternative } from '../types';
import {
  UploadCloud,
  FileCheck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Pill,
  X,
  FileText,
} from 'lucide-react';

interface PrescriptionUploadModalProps {
  onAddMultipleToCart: (
    items: { medicine: Medicine; generic: GenericAlternative; quantity: number }[]
  ) => void;
  onNavigateToCatalog: () => void;
}

export const PrescriptionUploadView: React.FC<PrescriptionUploadModalProps> = ({
  onAddMultipleToCart,
  onNavigateToCatalog,
}) => {
  const [selectedSample, setSelectedSample] = useState<number | null>(0);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(
    'dr_sarah_chen_rx_scan.pdf'
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(true);
  const [addedAll, setAddedAll] = useState(false);

  // Selected items inside the scanned prescription
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({
    'med-lipitor-20': true,
    'med-glucophage-500': true,
    'med-norvasc-5': true,
  });

  const handleSelectSample = (index: number) => {
    setSelectedSample(index);
    const sample = samplePrescriptions[index];
    setUploadedFileName(`${sample.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`);

    // Reset and trigger scan
    setIsScanning(true);
    setScanCompleted(false);

    setTimeout(() => {
      setIsScanning(false);
      setScanCompleted(true);
      const newSelected: Record<string, boolean> = {};
      sample.prescribedItems.forEach((item) => {
        newSelected[item.matchedId] = true;
      });
      setSelectedItems(newSelected);
    }, 900);
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      setSelectedSample(null);

      setIsScanning(true);
      setScanCompleted(false);

      setTimeout(() => {
        setIsScanning(false);
        setScanCompleted(true);
        // Map to sample cardio items by default for demonstration
        setSelectedItems({
          'med-augmentin-625': true,
          'med-panadol-crocin-650': true,
          'med-pantocid-40': true,
        });
      }, 1200);
    }
  };

  // Resolve matched medicines
  const currentItems =
    selectedSample !== null
      ? samplePrescriptions[selectedSample].prescribedItems.map((p) => {
          const med = medicineDatabase.find((m) => m.id === p.matchedId);
          return {
            prescriptionItem: p,
            medicine: med,
            generic: med ? med.suggestedGenerics[0] : null,
          };
        })
      : [
          {
            prescriptionItem: {
              brandName: 'Augmentin 625mg',
              matchedId: 'med-augmentin-625',
              dailyDose: '1 tab BD x 5 days',
            },
            medicine: medicineDatabase.find((m) => m.id === 'med-augmentin-625'),
            generic: medicineDatabase.find((m) => m.id === 'med-augmentin-625')?.suggestedGenerics[0],
          },
          {
            prescriptionItem: {
              brandName: 'Panadol Advance 650mg',
              matchedId: 'med-panadol-crocin-650',
              dailyDose: '1 tab SOS for fever',
            },
            medicine: medicineDatabase.find((m) => m.id === 'med-panadol-crocin-650'),
            generic: medicineDatabase.find((m) => m.id === 'med-panadol-crocin-650')?.suggestedGenerics[0],
          },
          {
            prescriptionItem: {
              brandName: 'Pantocid 40mg',
              matchedId: 'med-pantocid-40',
              dailyDose: '1 tab empty stomach',
            },
            medicine: medicineDatabase.find((m) => m.id === 'med-pantocid-40'),
            generic: medicineDatabase.find((m) => m.id === 'med-pantocid-40')?.suggestedGenerics[0],
          },
        ];

  const activeMatchedItems = currentItems.filter(
    (item) => item.medicine && item.generic && selectedItems[item.medicine.id]
  );

  const totalBrandedCost = activeMatchedItems.reduce(
    (acc, curr) => acc + (curr.medicine?.brandPrice || 0),
    0
  );
  const totalGenericCost = activeMatchedItems.reduce(
    (acc, curr) => acc + (curr.generic?.price || 0),
    0
  );
  const totalSavings = totalBrandedCost - totalGenericCost;
  const savingsPct = totalBrandedCost > 0 ? Math.round((totalSavings / totalBrandedCost) * 100) : 0;

  const handleAddAllToCart = () => {
    const itemsToAdd = activeMatchedItems.map((item) => ({
      medicine: item.medicine!,
      generic: item.generic!,
      quantity: 1,
    }));
    onAddMultipleToCart(itemsToAdd);
    setAddedAll(true);
    setTimeout(() => setAddedAll(false), 2000);
  };

  const toggleItem = (medId: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [medId]: !prev[medId],
    }));
  };

  return (
    <div className="space-y-6">
      {/* View Intro */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-700/80 text-emerald-100 border border-emerald-600/50 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> AI Prescription-to-Generic Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Upload Prescription & Find Bioequivalent Generics
          </h2>
          <p className="text-emerald-100 text-sm mt-2 leading-relaxed">
            Our optical verification system detects prescribed branded medications, isolates the active
            pharmaceutical salts, and matches you with certified generic substitutes verified by registered
            pharmacists.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload area and Sample Rx Pickers */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-zinc-900 mb-3 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-emerald-600" />
              Upload Doctor&apos;s Prescription
            </h3>

            <div className="border-2 border-dashed border-zinc-300 hover:border-emerald-500 rounded-xl p-6 text-center bg-zinc-50/50 hover:bg-emerald-50/20 transition-all relative">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleCustomFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-zinc-800">
                Click to browse or drag & drop prescription
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Supports PDF, JPG, PNG from camera or gallery
              </p>
            </div>

            {uploadedFileName && (
              <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2 truncate">
                  <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium truncate">{uploadedFileName}</span>
                </div>
                <span className="text-[10px] bg-emerald-200 text-emerald-800 font-bold px-1.5 py-0.5 rounded shrink-0">
                  Ready
                </span>
              </div>
            )}
          </div>

          {/* Preset Sample Prescriptions for Testing */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Or Try Sample Doctor Prescriptions:
              </h3>
            </div>

            <div className="space-y-2">
              {samplePrescriptions.map((sample, idx) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(idx)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedSample === idx
                      ? 'border-emerald-500 bg-emerald-50/60 shadow-xs'
                      : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900">{sample.title}</span>
                    <span className="text-[10px] text-zinc-400">{sample.date}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{sample.clinic}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-[10px] font-medium text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                      {sample.prescribedItems.length} Medications Prescribed
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pharmacist Safety Guarantee */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Registered Pharmacist Verification</p>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-normal">
                Every prescription uploaded is cross-verified by our licensed pharmacist prior to
                dispensation. Your generic alternatives have identical efficacy, dosage, and route of administration.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Extracted Medicines & Generic Alternatives Table */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200">
              <div>
                <h3 className="text-base font-bold text-zinc-900">
                  Detected Medications & Generic Equivalents
                </h3>
                <p className="text-xs text-zinc-500">
                  Review matched generic substitutes with exact active salt compositions
                </p>
              </div>

              {scanCompleted && (
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Scan Verified
                  </span>
                </div>
              )}
            </div>

            {isScanning ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-semibold text-zinc-800">
                  Scanning prescription & matching bioequivalent salts...
                </p>
                <p className="text-xs text-zinc-500">
                  Analyzing drug compounds and checking certified generic inventory
                </p>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {currentItems.map((item, idx) => {
                  if (!item.medicine || !item.generic) return null;
                  const isChecked = !!selectedItems[item.medicine.id];
                  const savings = item.medicine.brandPrice - item.generic.price;
                  const percent = Math.round((savings / item.medicine.brandPrice) * 100);

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
                        isChecked
                          ? 'border-emerald-300 bg-emerald-50/20'
                          : 'border-zinc-200 bg-zinc-50/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleItem(item.medicine!.id)}
                          className="mt-1 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        />

                        <div className="flex-1 min-w-0">
                          {/* Prescribed Drug Header */}
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <span className="text-xs font-semibold text-zinc-500">
                              Prescribed: <strong className="text-zinc-800">{item.prescriptionItem.brandName}</strong>
                            </span>
                            <span className="text-xs text-zinc-400 line-through">
                              ${item.medicine.brandPrice.toFixed(2)}
                            </span>
                          </div>

                          <div className="text-[11px] text-zinc-500 italic mt-0.5">
                            Rx Note: &ldquo;{item.prescriptionItem.dailyDose}&rdquo;
                          </div>

                          {/* Suggested Generic Box */}
                          <div className="mt-3 p-3 rounded-lg bg-white border border-emerald-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-emerald-900">
                                  {item.generic.name}
                                </span>
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                                  Save {percent}%
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-600 mt-0.5">
                                Salt: <strong className="text-zinc-800">{item.medicine.activeIngredient}</strong>
                              </p>
                              <p className="text-[10px] text-zinc-400">
                                Certified by {item.generic.manufacturer} • {item.generic.packSize}
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="text-base font-bold text-emerald-700">
                                ${item.generic.price.toFixed(2)}
                              </span>
                              <span className="block text-[10px] text-emerald-600 font-medium">
                                Save ${(item.medicine.brandPrice - item.generic.price).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Savings Summary Banner */}
                <div className="mt-6 p-5 rounded-2xl bg-zinc-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-zinc-400">Prescription Basket Comparison</div>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="text-zinc-400 line-through text-sm">
                        ${totalBrandedCost.toFixed(2)}
                      </span>
                      <span className="text-2xl font-bold text-emerald-400">
                        ${totalGenericCost.toFixed(2)}
                      </span>
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-2 py-0.5 rounded-full">
                        You Save ${totalSavings.toFixed(2)} ({savingsPct}%)
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleAddAllToCart}
                    disabled={activeMatchedItems.length === 0}
                    className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                      addedAll
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 disabled:opacity-50'
                    }`}
                  >
                    {addedAll ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Added {activeMatchedItems.length} Generics to Cart!
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Add All Generic Substitutes to Delivery
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
