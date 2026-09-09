/**
 * Cart routes — FR-PAY-01
 */

import { Router, Request, Response, NextFunction } from 'express';
import { Medicine } from '../models/Medicine.js';
import { CartItem } from '../models/CartItem.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

const DEFAULT_SESSION = 'default';

function formatCartItem(doc: any) {
  return {
    id: doc._id.toString(),
    medicineId: doc.medicineId.toString(),
    brandName: doc.brandName,
    activeIngredient: doc.activeIngredient,
    quantity: doc.quantity,
    rxRequired: doc.rxRequired,
    genericAlternative: {
      id: doc.genericAlternativeId.toString(),
      name: doc.genericName,
      manufacturer: doc.genericManufacturer,
      price: doc.genericPrice,
      packSize: doc.packSize,
      dosageForm: doc.dosageForm,
      strength: doc.strength,
      savingsPercentage: doc.savingsPercentage,
      fdaApproved: doc.fdaApproved,
      whoGmpCertified: doc.whoGmpCertified,
      labTested: doc.labTested,
      inStock: doc.inStock,
      rating: doc.rating,
      ratingCount: doc.ratingCount,
      deliveryEta: doc.deliveryEta,
    },
  };
}

/** GET /api/cart */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = (req.query.sessionId as string) || DEFAULT_SESSION;
    const items = await CartItem.find({ sessionId }).sort({ createdAt: -1 }).lean();
    const formatted = items.map(formatCartItem);

    const totalAmount = formatted.reduce((acc, i) => acc + i.genericAlternative.price * i.quantity, 0);
    const totalSaved = formatted.reduce((acc, i) => {
      const pct = i.genericAlternative.savingsPercentage || 80;
      const base = i.genericAlternative.price / (1 - pct / 100);
      return acc + (base - i.genericAlternative.price) * i.quantity;
    }, 0);

    res.json({
      success: true,
      data: {
        items: formatted,
        itemCount: formatted.reduce((acc, i) => acc + i.quantity, 0),
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalSaved: Math.round(totalSaved * 100) / 100,
      },
    });
  } catch (error) { next(error); }
});

/** POST /api/cart */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { medicineId, genericAlternativeId, quantity = 1 } = req.body;
    const sessionId = (req.body.sessionId as string) || DEFAULT_SESSION;

    if (!medicineId || !genericAlternativeId) {
      throw new AppError(400, 'INVALID_INPUT', 'medicineId and genericAlternativeId are required');
    }

    // Find medicine — support both legacyId and ObjectId
    const med = await Medicine.findOne({
      status: 'active',
      $or: [{ legacyId: medicineId }, ...(medicineId.match(/^[a-f\d]{24}$/i) ? [{ _id: medicineId }] : [])],
    }).lean();

    if (!med) throw new AppError(404, 'NOT_FOUND', 'Medicine not found or inactive');

    // Find the matching generic subdocument
    const gen = (med.suggestedGenerics || []).find(
      (g: any) => g._id.toString() === genericAlternativeId || g._id.toString() === genericAlternativeId
    );
    if (!gen) throw new AppError(404, 'NOT_FOUND', 'Generic alternative not found');
    if (!gen.inStock) throw new AppError(422, 'OUT_OF_STOCK', 'This product is currently out of stock');

    // Upsert: increment quantity if already in cart
    const existing = await CartItem.findOne({ sessionId, medicineId: med._id, genericAlternativeId: gen._id });

    if (existing) {
      existing.quantity += quantity;
      await existing.save();
      res.json({ success: true, data: { id: existing._id.toString(), quantity: existing.quantity, action: 'updated' } });
    } else {
      const item = await CartItem.create({
        sessionId,
        medicineId: med._id,
        genericAlternativeId: gen._id,
        brandName: med.brandName,
        activeIngredient: med.activeIngredient,
        rxRequired: med.rxRequired,
        genericName: gen.name,
        genericManufacturer: gen.manufacturer,
        genericPrice: gen.price,
        packSize: gen.packSize,
        dosageForm: gen.dosageForm,
        strength: gen.strength,
        savingsPercentage: gen.savingsPercentage,
        fdaApproved: gen.fdaApproved,
        whoGmpCertified: gen.whoGmpCertified,
        labTested: gen.labTested,
        inStock: gen.inStock,
        rating: gen.rating,
        ratingCount: gen.ratingCount,
        deliveryEta: gen.deliveryEta,
        quantity,
      });
      res.status(201).json({ success: true, data: { id: item._id.toString(), quantity, action: 'created' } });
    }
  } catch (error) { next(error); }
});

/** PUT /api/cart/:itemId */
router.put('/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await CartItem.findById(req.params.itemId);
    if (!item) throw new AppError(404, 'NOT_FOUND', 'Cart item not found');

    const { delta, quantity } = req.body;
    let newQty: number;
    if (typeof quantity === 'number') newQty = quantity;
    else if (typeof delta === 'number') newQty = item.quantity + delta;
    else throw new AppError(400, 'INVALID_INPUT', 'Provide delta or quantity');

    if (newQty <= 0) {
      await item.deleteOne();
      res.json({ success: true, data: { id: req.params.itemId, action: 'removed' } });
    } else {
      item.quantity = newQty;
      await item.save();
      res.json({ success: true, data: { id: req.params.itemId, quantity: newQty, action: 'updated' } });
    }
  } catch (error) { next(error); }
});

/** DELETE /api/cart/:itemId */
router.delete('/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await CartItem.findByIdAndDelete(req.params.itemId);
    if (!result) throw new AppError(404, 'NOT_FOUND', 'Cart item not found');
    res.json({ success: true, data: { id: req.params.itemId, action: 'removed' } });
  } catch (error) { next(error); }
});

/** DELETE /api/cart */
router.delete('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = (req.query.sessionId as string) || DEFAULT_SESSION;
    const result = await CartItem.deleteMany({ sessionId });
    res.json({ success: true, data: { cleared: result.deletedCount, action: 'cleared' } });
  } catch (error) { next(error); }
});

export default router;
