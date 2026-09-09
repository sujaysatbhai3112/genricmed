/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { medicineDatabase } from '../data/medicineDatabase';
import { Medicine, GenericAlternative } from '../types';
import { uploadPrescription, scanPrescriptionWithAi } from '../api';
import type { AiScanResult } from '../api';
import {
  UploadCloud,
  FileCheck,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
} from 'lucide-react';

// ─── Sample prescriptions for demo mode ──────────────────────────────────────

const samplePrescriptions = [
  {
    id: 'sample-cardio',
    title: 'Dr. Chen — Cardiology Rx',
    clinic: 'Springfield Heart & Vascular Clinic',
    date: 'Aug 30, 2026',
    prescribedItems: [
      { brandName: 'Lipitor 20mg', matchedId: 'med-lipitor-20', dailyDose: '1 tab at night' },
      { brandName: 'Norvasc 5mg', matchedId: 'med-norvasc-5', dailyDose: '1 tab morning' },
    ],
  },
  {
    id: 'sample-diabetes',
    title: 'Dr. Patel — Diabetes Rx',
    clinic: 'Metro Endocrinology Center',
    date: 'Sep 2, 2026',
    prescribedItems: [
      { brandName: 'Glucophage 500mg', matchedId: 'med-glucophage-500', dailyDose: '1 tab BD with meals' },
      { brandName: 'Januvia 100mg', matchedId: 'med-januvia-100', dailyDose: '1 tab OD' },
    ],
  },
  {
    id: 'sample-general',
    title: 'Dr. Williams — General Rx',
    clinic: 'City Primary Care',
    date: 'Sep 5, 2026',
    prescribedItems: [
      { brandName: 'Augmentin 625mg', matchedId: 'med-augmentin-625', dailyDose: '1 tab BD x 5 days' },
      { brandName: 'Panadol 650mg', matchedId: 'med-panadol-crocin-650', dailyDose: '1 tab SOS for fever' },
      { brandName: 'Pantocid 40mg', matchedId: 'med-pantocid-40', dailyDose: '1 tab empty stomach' },
    ],
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface DetectedItem {
  prescribedBrand: string;
  dailyDose: string;
  matchedMedicineId: string | null;
  saltDetected: string;
  medicine: Medicine | null;
  generic: GenericAlternative | null;
  brandPrice: number;
  genericPrice: number;
  savings: number;
  selected: boolean;
}

interface PrescriptionUploadProps {
  onAddMultipleToCart: (
    items: { medicine: Medicine; generic: GenericAlternative; quantity: number }[]
  ) => void;
  onNavigateToCatalog: () => void;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function resolveItem(matchedId: string | null, brandName: string, dailyDose: string): DetectedItem {
  const med = matchedId ? medicineDatabase.find((m) => m.id === matchedId) ?? null : null;
  const generic = med?.suggestedGenerics?.[0] ?? null;
  return {
    prescribedBrand: brandName,
    dailyDose,
    matchedMedicineId: matchedId,
    saltDetected: med?.activeIngredient ?? '',
    medicine: med,
    generic,
    brandPrice: med?.brandPrice ?? 0,
    genericPrice: generic?.price ?? 0,
    savings: med && generic ? med.brandPrice - generic.price : 0,
    selected: true,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export const PrescriptionUploadView: React.FC<PrescriptionUploadProps> = ({
  onAddMultipleToCart,
  onNavigateToCatalog,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('dr_sarah_chen_rx_scan.pdf');
  const [selectedSample, setSelectedSample] = useState<number | null>(0);

  const [isScanning, setIsScanning] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(true);
  const [scanError, setScanError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('done');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>(() =>
    samplePrescriptions[0].prescribedItems.map((p) =>
      resolveItem(p.matchedId, p.brandName, p.dailyDose)
    )
  );

  const [addedAll, setAddedAll] = useState(false);

  // ─── Sample prescription selected ──────────────────────────────────────────
  const handleSelectSample = (index: number) => {
    setSelectedSample(index);
    setUploadedFile(null);
    const sample = samplePrescriptions[index];
    setUploadedFileName(`${sample.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`);

    setIsScanning(true);
    setScanCompleted(false);
    setScanError(null);

    // Demo mode: simulate a short "scan" then resolve from local data
    setTimeout(() => {
      setDetectedItems(
        sample.prescribedItems.map((p) => resolveItem(p.matchedId, p.brandName, p.dailyDose))
      );
      setIsScanning(false);
      setScanCompleted(true);
    }, 900);
  };

  // ─── Real file chosen ───────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setUploadedFileName(file.name);
    setSelectedSample(null);
    setScanError(null);
    setUploadError(null);

    // Step 1: Upload the file to the server
    setUploadStatus('uploading');
    try {
      await uploadPrescription(file);
      setUploadStatus('done');
    } catch (err: any) {
      setUploadStatus('error');
      setUploadError(err?.message ?? 'Upload failed');
    }

    // Step 2: Run AI scan
    setIsScanning(true);
    setScanCompleted(false);
    try {
      const result: AiScanResult = await scanPrescriptionWithAi(file);
      const items: DetectedItem[] = result.detectedMedicines.map((d) => {
        const med = d.matchedMedicineId
          ? (medicineDatabase.find((m) => m.id === d.matchedMedicineId) ?? null)
          : null;
        const generic = med?.suggestedGenerics?.[0] ?? null;
        return {
          prescribedBrand: d.prescribedBrand,
          dailyDose: '',
          matchedMedicineId: d.matchedMedicineId,
          saltDetected: d.saltDetected,
          medicine: med,
          generic,
          brandPrice: d.brandPrice || med?.brandPrice || 0,
          genericPrice: d.genericPrice || generic?.price || 0,
          savings: d.savings,
          selected: true,
        };
      });
      setDetectedItems(items);
      setScanCompleted(true);
    } catch (err: any) {
      setScanError(err?.message ?? 'AI scan failed. Showing sample results instead.');
      // Fall back to a default set so the UI is still useful
      setDetectedItems(
        samplePrescriptions[2].prescribedItems.map((p) =>
          resolveItem(p.matchedId, p.brandName, p.dailyDose)
        )
      );
      setScanCompleted(true);
    } finally {
      setIsScanning(false);
    }
  };

  const toggleItem = (index: number) => {
    setDetectedItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, selected: !item.selected } : item))
    );
  };

  const activeItems = detectedItems.filter((i) => i.selected && i.medicine && i.generic);

  const totalBrandedCost = activeItems.reduce((acc, i) => acc + i.brandPrice, 0);
  const totalGenericCost = activeItems.reduce((acc, i) => acc + i.genericPrice, 0);
  const totalSavings = totalBrandedCost - totalGenericCost;
  const savingsPct = totalBrandedCost > 0 ? Math.round((totalSavings / totalBrandedCost) * 100) : 0;

  const handleAddAllToCart = () => {
    const itemsToAdd = activeItems.map((item) => ({
      medicine: item.medicine!,
      generic: item.generic!,
      quantity: 1,
    }));
    onAddMultipleToCart(itemsToAdd);
    setAddedAll(true);
    setTimeout(() => setAddedAll(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-700/80 text-emerald-100 border border-emerald-600/50 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> AI Prescription-to-Generic Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Upload Prescription & Find Bioequivalent Generics
          </h2>
          <p className="text-emerald-100 text-sm mt-2 leading-relaxed">
            Our AI optical verification system detects prescribed branded medications, isolates active
            pharmaceutical salts, and matches you with certified generic substitutes verified by
            registered pharmacists.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upload + Sample Picker */}
        <div className="lg:col-span-5 space-y-4">
          {/* Upload Drop Zone */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-zinc-900 mb-3 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-emerald-600" />
              Upload Doctor's Prescription
            </h3>

            <div
              className="border-2 border-dashed border-zinc-300 hover:border-emerald-500 rounded-xl p-6 text-center bg-zinc-50/50 hover:bg-emerald-50/20 transition-all relative cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-zinc-800">
                Click to browse or drag & drop prescription
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Supports PDF, JPG, PNG — up to 10 MB
              </p>
            </div>

            {/* Upload status */}
            {uploadedFileName && (
              <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2 truncate">
                  <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium truncate">{uploadedFileName}</span>
                </div>
                <span className="text-[10px] bg-emerald-200 text-emerald-800 font-bold px-1.5 py-0.5 rounded shrink-0">
                  {uploadStatus === 'uploading' ? 'Uploading…' : uploadStatus === 'error' ? 'Upload failed' : 'Ready'}
                </span>
              </div>
            )}

            {uploadError && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-700">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {uploadError}
              </div>
            )}
          </div>

          {/* Sample Prescriptions */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
              Or try a sample prescription:
            </h3>
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
                  <span className="inline-block mt-2 text-[10px] font-medium text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                    {sample.prescribedItems.length} Medications
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Safety note */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Registered Pharmacist Verification</p>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-normal">
                Every uploaded prescription is cross-verified by our licensed pharmacist before
                dispensation. Your AI-matched generics have identical efficacy and route of
                administration.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Results */}
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
              {scanCompleted && !scanError && (
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Scan Verified
                </span>
              )}
            </div>

            {/* Scan error banner */}
            {scanError && (
              <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>{scanError}</span>
              </div>
            )}

            {isScanning ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 border-[3px] border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-semibold text-zinc-800">
                  {uploadedFile
                    ? 'AI is analyzing your prescription & matching salts…'
                    : 'Scanning prescription & matching bioequivalent salts…'}
                </p>
                <p className="text-xs text-zinc-500">
                  Analyzing drug compounds and checking certified generic inventory
                </p>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {detectedItems.length === 0 && (
                  <p className="text-xs text-zinc-500 text-center py-8">
                    No medicines detected. Try a different prescription file.
                  </p>
                )}

                {detectedItems.map((item, idx) => {
                  if (!item.medicine || !item.generic) return null;
                  const percent = Math.round((item.savings / item.brandPrice) * 100);

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
                        item.selected
                          ? 'border-emerald-300 bg-emerald-50/20'
                          : 'border-zinc-200 bg-zinc-50/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => toggleItem(idx)}
                          className="mt-1 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <span className="text-xs font-semibold text-zinc-500">
                              Prescribed: <strong className="text-zinc-800">{item.prescribedBrand}</strong>
                            </span>
                            <span className="text-xs text-zinc-400 line-through">
                              ${item.brandPrice.toFixed(2)}
                            </span>
                          </div>
                          {item.dailyDose && (
                            <div className="text-[11px] text-zinc-500 italic mt-0.5">
                              Rx Note: "{item.dailyDose}"
                            </div>
                          )}
                          <div className="mt-3 p-3 rounded-lg bg-white border border-emerald-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-emerald-900">
                                  {item.generic.name}
                                </span>
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                  Save {percent}%
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-600 mt-0.5">
                                Salt: <strong className="text-zinc-800">{item.medicine.activeIngredient}</strong>
                              </p>
                              <p className="text-[10px] text-zinc-400">
                                {item.generic.manufacturer} • {item.generic.packSize}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-base font-bold text-emerald-700">
                                ${item.genericPrice.toFixed(2)}
                              </span>
                              <span className="block text-[10px] text-emerald-600 font-medium">
                                Save ${item.savings.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Savings Summary Banner */}
                {detectedItems.length > 0 && (
                  <div className="mt-4 p-5 rounded-2xl bg-zinc-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
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
                          Save ${totalSavings.toFixed(2)} ({savingsPct}%)
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleAddAllToCart}
                      disabled={activeItems.length === 0}
                      className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                        addedAll
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 disabled:opacity-50'
                      }`}
                    >
                      {addedAll ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Added {activeItems.length} Generics!
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" /> Add All Generic Substitutes to Cart
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
