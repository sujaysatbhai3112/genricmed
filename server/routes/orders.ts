/**
 * Order routes — FR-PAY-03, FR-PAY-04, FR-ORD-01 to FR-ORD-04
 */

import { Router, Request, Response, NextFunction } from 'express';
import { CartItem } from '../models/CartItem.js';
import { Order } from '../models/Order.js';
import { AuditEvent } from '../models/AuditEvent.js';
import { AppError } from '../middleware/errorHandler.js';
import mongoose from 'mongoose';

const router = Router();
const DEFAULT_SESSION = 'default';

const VALID_TRANSITIONS: Record<string, string[]> = {
  order_placed:     ['rx_verified', 'cancelled'],
  rx_verified:      ['dispensed', 'cancelled'],
  dispensed:        ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered'],
  delivered:        [],
  cancelled:        [],
};

const DELIVERY_CONFIG: Record<string, { fee: number; eta: string }> = {
  express:  { fee: 3.99, eta: 'Today in 45-60 minutes' },
  'same-day': { fee: 1.99, eta: 'Today by 8:00 PM' },
  standard: { fee: 0,    eta: 'Tomorrow afternoon' },
};

function formatOrder(doc: any) {
  return {
    id: doc.orderId,
    _id: doc._id,
    createdAt: doc.createdAt,
    totalAmount: doc.totalAmount,
    totalSaved: doc.totalSaved,
    deliverySpeed: doc.deliverySpeed,
    deliveryFee: doc.deliveryFee,
    deliveryAddress: doc.deliveryAddress,
    paymentMethod: doc.paymentMethod,
    status: doc.status,
    prescriptionAttached: doc.prescriptionAttached,
    pharmacistName: doc.pharmacistName,
    licenseNumber: doc.licenseNumber,
    estimatedDeliveryTime: doc.estimatedDeliveryTime,
    riderName: doc.riderName,
    riderPhone: doc.riderPhone,
    items: (doc.items || []).map((item: any) => ({
      id: item._id?.toString(),
      medicineId: item.medicineId?.toString(),
      brandName: item.brandName,
      genericName: item.genericName,
      activeIngredient: item.activeIngredient,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      rxRequired: item.rxRequired,
      genericAlternative: {
        id: item.genericAlternativeId?.toString(),
        name: item.genericName,
        price: item.unitPrice,
      },
    })),
  };
}

/** POST /api/orders */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      deliveryAddress = {},
      deliverySpeed = 'standard',
      paymentMethod = 'cod',
      prescriptionAttached = false,
      idempotencyKey,
    } = req.body;
    const sessionId = (req.body.sessionId as string) || DEFAULT_SESSION;

    // Idempotency check
    if (idempotencyKey) {
      const existing = await Order.findOne({ idempotencyKey }).lean();
      if (existing) {
        res.json({ success: true, data: { ...formatOrder(existing), action: 'already_exists' } });
        return;
      }
    }

    const cartItems = await CartItem.find({ sessionId }).lean();
    if (cartItems.length === 0) throw new AppError(400, 'EMPTY_CART', 'Cart is empty');

    const outOfStock = cartItems.filter((i) => !i.inStock);
    if (outOfStock.length > 0) throw new AppError(422, 'OUT_OF_STOCK', `${outOfStock.length} item(s) are out of stock`);

    const subtotal = cartItems.reduce((acc, i) => acc + i.genericPrice * i.quantity, 0);
    const config = DELIVERY_CONFIG[deliverySpeed] ?? DELIVERY_CONFIG.standard;
    const deliveryFee = deliverySpeed === 'standard' && subtotal >= 25 ? 0 : config.fee;
    const grandTotal = Math.round((subtotal + deliveryFee) * 100) / 100;

    const brandTotal = cartItems.reduce((acc, i) => {
      const pct = i.savingsPercentage || 80;
      return acc + (i.genericPrice / (1 - pct / 100)) * i.quantity;
    }, 0);
    const totalSaved = Math.round(Math.max(0, brandTotal - subtotal) * 100) / 100;

    const orderId = `ORD-GEN-${Math.floor(Math.random() * 899999 + 100000)}`;

    const session = await mongoose.startSession();
    let created: any;

    await session.withTransaction(async () => {
      [created] = await Order.create([{
        orderId,
        sessionId,
        totalAmount: grandTotal,
        totalSaved,
        deliverySpeed,
        deliveryFee,
        deliveryAddress,
        paymentMethod,
        status: 'order_placed',
        prescriptionAttached,
        estimatedDeliveryTime: config.eta,
        riderName: 'Carlos Ramirez',
        riderPhone: '+1 (555) 902-1144',
        idempotencyKey: idempotencyKey || undefined,
        items: cartItems.map((i) => ({
          medicineId: i.medicineId,
          genericAlternativeId: i.genericAlternativeId,
          brandName: i.brandName,
          genericName: i.genericName,
          activeIngredient: i.activeIngredient,
          quantity: i.quantity,
          unitPrice: i.genericPrice,
          totalPrice: Math.round(i.genericPrice * i.quantity * 100) / 100,
          rxRequired: i.rxRequired,
        })),
      }], { session });

      await CartItem.deleteMany({ sessionId }, { session });

      await AuditEvent.create([{
        actorId: sessionId,
        actorRole: 'customer',
        action: 'order_created',
        targetType: 'order',
        targetId: orderId,
        details: { totalAmount: grandTotal, itemCount: cartItems.length, paymentMethod },
      }], { session });
    });

    session.endSession();

    res.status(201).json({
      success: true,
      data: {
        id: orderId,
        status: 'order_placed',
        totalAmount: grandTotal,
        totalSaved,
        deliverySpeed,
        deliveryFee,
        estimatedDeliveryTime: config.eta,
        itemCount: cartItems.length,
        prescriptionAttached,
        paymentMethod,
        pharmacistName: 'Dr. Emily Vance (Pharm.D)',
        licenseNumber: 'RPH-849204',
        riderName: 'Carlos Ramirez',
        riderPhone: '+1 (555) 902-1144',
        createdAt: created.createdAt,
      },
    });
  } catch (error) { next(error); }
});

/** GET /api/orders */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = (req.query.sessionId as string) || DEFAULT_SESSION;
    const docs = await Order.find({ sessionId }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: { orders: docs.map(formatOrder), total: docs.length } });
  } catch (error) { next(error); }
});

/** GET /api/orders/:id */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await Order.findOne({ orderId: req.params.id }).lean();
    if (!doc) throw new AppError(404, 'NOT_FOUND', `Order '${req.params.id}' not found`);
    res.json({ success: true, data: formatOrder(doc) });
  } catch (error) { next(error); }
});

/** PATCH /api/orders/:id/status */
router.patch('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status: newStatus } = req.body;
    if (!newStatus) throw new AppError(400, 'INVALID_INPUT', 'status is required');

    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) throw new AppError(404, 'NOT_FOUND', `Order '${req.params.id}' not found`);

    const valid = VALID_TRANSITIONS[order.status] || [];
    if (!valid.includes(newStatus)) {
      throw new AppError(422, 'INVALID_TRANSITION',
        `Cannot transition from '${order.status}' to '${newStatus}'. Valid: ${valid.join(', ') || 'none'}`);
    }

    const prev = order.status;
    order.status = newStatus;
    await order.save();

    await AuditEvent.create({
      actorId: 'system', actorRole: 'system',
      action: 'order_status_changed', targetType: 'order', targetId: req.params.id,
      details: { fromStatus: prev, toStatus: newStatus },
    });

    res.json({ success: true, data: { id: req.params.id, previousStatus: prev, currentStatus: newStatus } });
  } catch (error) { next(error); }
});

/** POST /api/orders/:id/cancel */
router.post('/:id/cancel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) throw new AppError(404, 'NOT_FOUND', `Order '${req.params.id}' not found`);

    const cancellable = ['order_placed', 'rx_verified', 'dispensed'];
    if (!cancellable.includes(order.status)) {
      throw new AppError(422, 'INVALID_TRANSITION', `Order cannot be cancelled — it is already '${order.status}'`);
    }

    const prev = order.status;
    order.status = 'cancelled';
    await order.save();

    await AuditEvent.create({
      actorId: 'customer', actorRole: 'customer',
      action: 'order_cancelled', targetType: 'order', targetId: req.params.id,
      details: { previousStatus: prev },
    });

    res.json({ success: true, data: { id: req.params.id, status: 'cancelled', previousStatus: prev } });
  } catch (error) { next(error); }
});

export default router;
