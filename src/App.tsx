/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Medicine,
  GenericAlternative,
  CartItem,
  Order,
  DeliveryOption,
  MedicineCategory,
} from './types';
import {
  fetchMedicines,
  fetchDeliveryOptions,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  clearCart as apiClearCart,
  fetchCart,
  fetchOrders,
  advanceOrderStatus as apiAdvanceOrderStatus,
} from './api';
import { Header } from './components/Header';
import { MedicineSearch } from './components/MedicineSearch';
import { MedicineCard } from './components/MedicineCard';
import { PrescriptionUploadView } from './components/PrescriptionUploadModal';
import { SavingsCalculator } from './components/SavingsCalculator';
import { OrderTrackerView } from './components/OrderTrackerModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { MedicineDetailModal } from './components/MedicineDetailModal';
import { PharmacistHelpModal } from './components/PharmacistHelpModal';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  FileText,
  AlertCircle,
  Pill,
  TrendingDown,
  Info,
} from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'prescription' | 'calculator' | 'orders'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<MedicineCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRxOnly, setFilterRxOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'savings' | 'price-asc' | 'rating'>('savings');
  const [deliveryPincode, setDeliveryPincode] = useState('10001');

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPharmacistHelpOpen, setIsPharmacistHelpOpen] = useState(false);
  const [selectedDetailMedicine, setSelectedDetailMedicine] = useState<Medicine | null>(null);

  // Data from API
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [medicinesLoading, setMedicinesLoading] = useState(true);
  const [medicinesError, setMedicinesError] = useState<string | null>(null);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);

  // Cart state (synced with backend)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(false);

  // Orders state (synced with backend)
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrderForTracker, setActiveOrderForTracker] = useState<Order | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  // ─── Load medicines from API on mount ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setMedicinesLoading(true);
        setMedicinesError(null);
        const data = await fetchMedicines({ limit: 100 });
        if (!cancelled) setMedicines(data.medicines);
      } catch (err) {
        if (!cancelled) {
          setMedicinesError('Could not load medicines. Make sure the server is running.');
          console.error('[App] fetchMedicines error:', err);
        }
      } finally {
        if (!cancelled) setMedicinesLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // ─── Load delivery options on mount ────────────────────────────────────────
  useEffect(() => {
    fetchDeliveryOptions()
      .then((data) => setDeliveryOptions(data.options))
      .catch((err) => console.error('[App] fetchDeliveryOptions error:', err));
  }, []);

  // ─── Load cart from API on mount ────────────────────────────────────────────
  useEffect(() => {
    fetchCart()
      .then((data) => setCart(data.items))
      .catch((err) => console.error('[App] fetchCart error:', err));
  }, []);

  // ─── Load orders from API on mount ──────────────────────────────────────────
  const refreshOrders = useCallback(async () => {
    try {
      const data = await fetchOrders();
      setOrders(data.orders);
      if (data.orders.length > 0 && !activeOrderForTracker) {
        setActiveOrderForTracker(data.orders[0]);
      }
    } catch (err) {
      console.error('[App] fetchOrders error:', err);
    }
  }, [activeOrderForTracker]);

  useEffect(() => {
    refreshOrders();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Cart Operations (API-backed) ───────────────────────────────────────────
  const handleAddToCart = useCallback(async (
    medicine: Medicine,
    generic: GenericAlternative,
    quantity: number = 1
  ) => {
    try {
      await apiAddToCart(medicine.id, generic.id, quantity);
      // Refresh cart from server for accurate state
      const data = await fetchCart();
      setCart(data.items);
      addToast(`Added ${generic.name} to delivery cart`, 'success');
    } catch (err: any) {
      addToast(err?.message ?? 'Failed to add item to cart', 'error');
    }
  }, [addToast]);

  const handleAddMultipleToCart = useCallback(async (
    items: { medicine: Medicine; generic: GenericAlternative; quantity: number }[]
  ) => {
    try {
      // Add all items sequentially to avoid race conditions on the session cart
      for (const { medicine, generic, quantity } of items) {
        await apiAddToCart(medicine.id, generic.id, quantity);
      }
      const data = await fetchCart();
      setCart(data.items);
      addToast(`Added ${items.length} generic substitutes to delivery cart!`, 'success');
    } catch (err: any) {
      addToast(err?.message ?? 'Failed to add items to cart', 'error');
    }
  }, [addToast]);

  const handleUpdateCartQuantity = useCallback(async (id: string, delta: number) => {
    // Optimistic update
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );

    try {
      await apiUpdateCartItem(id, delta);
    } catch (err: any) {
      // Roll back on failure
      const data = await fetchCart();
      setCart(data.items);
      addToast(err?.message ?? 'Failed to update cart', 'error');
    }
  }, [addToast]);

  const handleRemoveCartItem = useCallback(async (id: string) => {
    // Optimistic update
    setCart((prev) => prev.filter((item) => item.id !== id));
    try {
      await apiRemoveCartItem(id);
      addToast('Item removed from delivery cart', 'info');
    } catch (err: any) {
      const data = await fetchCart();
      setCart(data.items);
      addToast(err?.message ?? 'Failed to remove item', 'error');
    }
  }, [addToast]);

  const handleClearCart = useCallback(async () => {
    setCart([]);
    try {
      await apiClearCart();
    } catch (err: any) {
      const data = await fetchCart();
      setCart(data.items);
      addToast(err?.message ?? 'Failed to clear cart', 'error');
    }
  }, [addToast]);

  // ─── Order Placement (called by CheckoutModal after API success) ─────────
  const handleOrderPlaced = useCallback(async (newOrder: Order) => {
    // Cart is cleared server-side by the orders route — refresh from API
    const cartData = await fetchCart().catch(() => ({ items: [] as CartItem[] }));
    setCart(cartData.items);

    // Refresh orders list
    const ordersData = await fetchOrders().catch(() => ({ orders: [] as Order[] }));
    setOrders(ordersData.orders);
    setActiveOrderForTracker(newOrder);

    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setActiveTab('orders');
    addToast(`Order #${newOrder.id} placed! Dispatched for doorstep delivery.`, 'success');
  }, [addToast]);

  // ─── Advance Order Status via API ──────────────────────────────────────────
  const handleAdvanceOrderStatus = useCallback(async (orderId: string) => {
    const statuses: Order['status'][] = [
      'order_placed',
      'rx_verified',
      'dispensed',
      'out_for_delivery',
      'delivered',
    ];

    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const currentIndex = statuses.indexOf(order.status);
    const nextStatus = statuses[Math.min(statuses.length - 1, currentIndex + 1)];
    if (nextStatus === order.status) return;

    try {
      await apiAdvanceOrderStatus(orderId, nextStatus);
      // Refresh orders
      const data = await fetchOrders();
      setOrders(data.orders);
      const updated = data.orders.find((o) => o.id === orderId);
      if (updated) setActiveOrderForTracker(updated);
      addToast('Order progressed to next milestone', 'info');
    } catch (err: any) {
      addToast(err?.message ?? 'Failed to advance order status', 'error');
    }
  }, [orders, addToast]);

  // ─── Client-side filter & sort of API-loaded medicines ────────────────────
  const filteredMedicines = useMemo(() => {
    let list = [...medicines];

    if (selectedCategory !== 'all') {
      list = list.filter((m) => m.category === selectedCategory);
    }
    if (filterRxOnly) {
      list = list.filter((m) => m.rxRequired);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.brandName.toLowerCase().includes(q) ||
          m.activeIngredient.toLowerCase().includes(q) ||
          m.brandManufacturer.toLowerCase().includes(q) ||
          m.treatmentFor.toLowerCase().includes(q) ||
          m.suggestedGenerics.some(
            (g) => g.name.toLowerCase().includes(q) || g.manufacturer.toLowerCase().includes(q)
          )
      );
    }
    list.sort((a, b) => {
      const aGen = a.suggestedGenerics[0];
      const bGen = b.suggestedGenerics[0];
      if (!aGen || !bGen) return 0;
      if (sortBy === 'savings') {
        const aSavingsPct = ((a.brandPrice - aGen.price) / a.brandPrice) * 100;
        const bSavingsPct = ((b.brandPrice - bGen.price) / b.brandPrice) * 100;
        return bSavingsPct - aSavingsPct;
      }
      if (sortBy === 'price-asc') return aGen.price - bGen.price;
      if (sortBy === 'rating') return bGen.rating - aGen.rating;
      return 0;
    });
    return list;
  }, [medicines, selectedCategory, filterRxOnly, searchQuery, sortBy]);

  const cartTotalSaved = useMemo(() => {
    return cart.reduce((acc, curr) => {
      const pct = curr.genericAlternative.savingsPercentage || 80;
      const baseBrand = curr.genericAlternative.price / (1 - pct / 100);
      return acc + (baseBrand - curr.genericAlternative.price) * curr.quantity;
    }, 0);
  }, [cart]);

  return (
    <div
      id="generic-med-app"
      className="min-h-screen bg-zinc-100/70 text-zinc-900 font-sans antialiased selection:bg-emerald-600 selection:text-white flex flex-col justify-between"
    >
      <div>
        {/* Navigation Header */}
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          cartCount={cart.reduce((acc, i) => acc + i.quantity, 0)}
          cartTotalSaved={cartTotalSaved}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenPharmacistHelp={() => setIsPharmacistHelpOpen(true)}
          deliveryPincode={deliveryPincode}
          onChangePincode={(pin) => {
            setDeliveryPincode(pin);
            addToast(`Delivery zip set to ${pin}. Express delivery available.`);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Main Content Workspace */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* TAB 1: Search & Generic Suggestion Catalog */}
          {activeTab === 'catalog' && (
            <div className="space-y-6">
              {/* Hero Banner */}
              <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-700/80 text-emerald-100 border border-emerald-600/50 mb-3">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    Bioequivalent Generic Medicine Finder
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                    Same Active Salt. Same Clinical Healing. Up to 85% Less Cost.
                  </h1>
                  <p className="text-emerald-100 text-xs sm:text-sm mt-2 leading-relaxed">
                    Search your branded prescription medicines (like Lipitor, Augmentin, or Glucophage)
                    to instantly discover certified generic alternatives manufactured under strict WHO-GMP
                    protocols, delivered directly to your doorstep in temperature-controlled packaging.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-emerald-700/60 text-xs text-emerald-200">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100% Identical Active Salt Molecule
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-emerald-400" /> Express 45-min Doorstep Delivery
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified by Registered Pharmacists
                    </span>
                  </div>
                </div>
              </div>

              {/* Search & Filter Controls */}
              <MedicineSearch
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => setSelectedCategory(cat)}
                searchQuery={searchQuery}
                onSelectSuggestedBrand={(brand) => setSearchQuery(brand)}
                filterRxOnly={filterRxOnly}
                onToggleFilterRxOnly={() => setFilterRxOnly((v) => !v)}
                sortBy={sortBy}
                onSortChange={setSortBy}
                totalResults={filteredMedicines.length}
              />

              {/* Loading state */}
              {medicinesLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-zinc-200 p-6 animate-pulse h-56" />
                  ))}
                </div>
              )}

              {/* Error state */}
              {!medicinesLoading && medicinesError && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                  <p className="text-sm font-semibold text-rose-800">{medicinesError}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-xs text-rose-700 underline cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Medicine Cards Grid */}
              {!medicinesLoading && !medicinesError && (
                filteredMedicines.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto">
                      <Pill className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-800">No matching medicines found</h3>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      Try searching by common brand name (e.g., Lipitor, Augmentin, Crocin) or active ingredient (e.g., Atorvastatin, Metformin).
                    </p>
                    <button
                      onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setFilterRxOnly(false); }}
                      className="mt-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                    >
                      Reset all filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredMedicines.map((med) => (
                      <MedicineCard
                        key={med.id}
                        medicine={med}
                        onAddToCart={handleAddToCart}
                        onViewDetails={(m) => setSelectedDetailMedicine(m)}
                      />
                    ))}
                  </div>
                )
              )}
            </div>
          )}

          {/* TAB 2: Prescription Analyzer */}
          {activeTab === 'prescription' && (
            <PrescriptionUploadView
              onAddMultipleToCart={handleAddMultipleToCart}
              onNavigateToCatalog={() => setActiveTab('catalog')}
            />
          )}

          {/* TAB 3: Savings Calculator */}
          {activeTab === 'calculator' && (
            <SavingsCalculator onAddMultipleToCart={handleAddMultipleToCart} />
          )}

          {/* TAB 4: Orders & Delivery Tracker */}
          {activeTab === 'orders' && (
            <OrderTrackerView
              order={activeOrderForTracker}
              allOrders={orders}
              onSelectOrder={(ord) => setActiveOrderForTracker(ord)}
              onClose={() => setActiveTab('catalog')}
              onAdvanceStatus={handleAdvanceOrderStatus}
              onRefresh={refreshOrders}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-zinc-200/80 py-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>WHO-GMP & FDA Regulated</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                All generic medicines listed are bioequivalent to innovator brands, meeting rigorous
                pharmacopeia purity and dissolution specifications.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Express Cold-Chain Delivery</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Direct dispatch from certified local pharmacies in tamper-evident containers within 45 to
                90 minutes.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Licensed Pharmacist Verification</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Every prescription order is audited by registered clinical pharmacists (Pharm.D) before
                dispensation.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                <span>Guaranteed Affordable Healthcare</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Save 60% to 85% on chronic and acute medications without ever sacrificing clinical
                efficacy or safety.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400">
            <div>
              © 2026 GenericMed Healthcare Systems Inc. • Certified Pharmacy License #RPH-849204.
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setIsPharmacistHelpOpen(true)} className="hover:text-zinc-600 cursor-pointer">
                Clinical Disclaimers
              </button>
              <span>•</span>
              <button onClick={() => setIsPharmacistHelpOpen(true)} className="hover:text-zinc-600 cursor-pointer">
                Pharmacist Consultation
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
        onNavigateToPrescription={() => { setIsCartOpen(false); setActiveTab('prescription'); }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        deliveryPincode={deliveryPincode}
        deliveryOptions={deliveryOptions}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* Medicine Detail Modal */}
      <MedicineDetailModal
        medicine={selectedDetailMedicine}
        onClose={() => setSelectedDetailMedicine(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Pharmacist Help Modal */}
      <PharmacistHelpModal
        isOpen={isPharmacistHelpOpen}
        onClose={() => setIsPharmacistHelpOpen(false)}
      />

      {/* Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 bg-zinc-900 text-white text-xs font-medium rounded-xl shadow-lg border border-zinc-800"
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-teal-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
