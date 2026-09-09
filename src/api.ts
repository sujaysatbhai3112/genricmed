/**
 * API client — all backend fetch helpers
 * All calls go through Vite's /api proxy to http://localhost:3001
 */

import type { Medicine, GenericAlternative, CartItem, DeliveryOption, Order } from './types';

// In production the frontend is served from a separate static site,
// so API calls must hit the deployed backend URL.
// VITE_API_URL e.g. "https://genericmed-api.onrender.com"
const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

// ─── Generic fetch wrapper ───────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    ...options,
  });

  const json = await res.json();

  if (!res.ok) {
    const message = json?.error?.message ?? json?.message ?? `HTTP ${res.status}`;
    throw new Error(message);
  }

  return json.data as T;
}

// ─── Medicines ────────────────────────────────────────────────────────────────

export async function fetchMedicines(params?: {
  category?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}): Promise<{ medicines: Medicine[]; total: number; page: number; pages: number }> {
  const qs = new URLSearchParams();
  if (params?.category && params.category !== 'all') qs.set('category', params.category);
  if (params?.sortBy) qs.set('sortBy', params.sortBy);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const query = qs.toString() ? `?${qs}` : '';
  return apiFetch(`/medicines${query}`);
}

export async function fetchMedicineById(id: string): Promise<Medicine> {
  return apiFetch(`/medicines/${id}`);
}

export async function searchMedicines(q: string, params?: {
  category?: string;
  sortBy?: string;
}): Promise<{ results: Medicine[]; total: number; query: string }> {
  const qs = new URLSearchParams({ q });
  if (params?.category && params.category !== 'all') qs.set('category', params.category);
  if (params?.sortBy) qs.set('sortBy', params.sortBy);
  return apiFetch(`/search?${qs}`);
}

export async function fetchSearchSuggestions(q: string): Promise<{ suggestions: string[] }> {
  return apiFetch(`/search/suggestions?q=${encodeURIComponent(q)}`);
}

// ─── Delivery ─────────────────────────────────────────────────────────────────

export async function fetchDeliveryOptions(): Promise<{ options: DeliveryOption[] }> {
  return apiFetch('/delivery/options');
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartApiResponse {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  totalSaved: number;
}

export async function fetchCart(): Promise<CartApiResponse> {
  return apiFetch('/cart');
}

export async function addToCart(
  medicineId: string,
  genericAlternativeId: string,
  quantity = 1
): Promise<{ id: string; quantity: number; action: string }> {
  return apiFetch('/cart', {
    method: 'POST',
    body: JSON.stringify({ medicineId, genericAlternativeId, quantity }),
  });
}

export async function updateCartItem(
  itemId: string,
  delta: number
): Promise<{ id: string; quantity?: number; action: string }> {
  return apiFetch(`/cart/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ delta }),
  });
}

export async function removeCartItem(
  itemId: string
): Promise<{ id: string; action: string }> {
  return apiFetch(`/cart/${itemId}`, { method: 'DELETE' });
}

export async function clearCart(): Promise<{ cleared: number; action: string }> {
  return apiFetch('/cart', { method: 'DELETE' });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface PlaceOrderPayload {
  deliveryAddress: {
    fullName: string;
    phone: string;
    pincode: string;
    streetAddress: string;
    city: string;
    state: string;
    addressType: string;
    deliveryNotes?: string;
  };
  deliverySpeed: string;
  paymentMethod: 'cod' | 'card' | 'upi';
  prescriptionAttached: boolean;
  idempotencyKey?: string;
}

export interface PlaceOrderResponse {
  id: string;
  status: string;
  totalAmount: number;
  totalSaved: number;
  deliverySpeed: string;
  deliveryFee: number;
  estimatedDeliveryTime: string;
  itemCount: number;
  prescriptionAttached: boolean;
  paymentMethod: string;
  pharmacistName: string;
  licenseNumber: string;
  riderName: string;
  riderPhone: string;
  createdAt: string;
}

export async function placeOrder(payload: PlaceOrderPayload): Promise<PlaceOrderResponse> {
  return apiFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchOrders(): Promise<{ orders: Order[]; total: number }> {
  return apiFetch('/orders');
}

export async function fetchOrderById(id: string): Promise<Order> {
  return apiFetch(`/orders/${id}`);
}

export async function advanceOrderStatus(
  orderId: string,
  status: string
): Promise<{ id: string; status: string }> {
  return apiFetch(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function cancelOrder(
  orderId: string
): Promise<{ id: string; status: string }> {
  return apiFetch(`/orders/${orderId}/cancel`, { method: 'POST' });
}

// ─── Prescriptions ────────────────────────────────────────────────────────────

export interface PrescriptionUploadResult {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: string;
  message: string;
}

export async function uploadPrescription(
  file: File,
  orderId?: string
): Promise<PrescriptionUploadResult> {
  const form = new FormData();
  form.append('prescription', file);
  if (orderId) form.append('orderId', orderId);

  const res = await fetch(`${BASE}/prescriptions/upload`, {
    method: 'POST',
    body: form,
    // No Content-Type header — browser sets it with correct boundary for multipart
  });

  const json = await res.json();
  if (!res.ok) {
    const message = json?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(message);
  }
  return json.data as PrescriptionUploadResult;
}

export interface AiScanResult {
  detectedMedicines: {
    prescribedBrand: string;
    saltDetected: string;
    matchedMedicineId: string | null;
    recommendedGeneric: string;
    brandPrice: number;
    genericPrice: number;
    savings: number;
    selected: boolean;
  }[];
  doctorName: string;
  clinicName: string;
  date: string;
  rawText?: string;
}

export async function scanPrescriptionWithAi(
  file: File
): Promise<AiScanResult> {
  const form = new FormData();
  form.append('prescription', file);

  const res = await fetch(`${BASE}/prescriptions/scan-ai`, {
    method: 'POST',
    body: form,
  });

  const json = await res.json();
  if (!res.ok) {
    const message = json?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(message);
  }
  return json.data as AiScanResult;
}
