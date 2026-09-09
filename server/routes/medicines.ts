/**
 * Medicine routes — FR-CORE-01 to FR-CORE-06
 */

import { Router, Request, Response, NextFunction } from 'express';
import { Medicine } from '../models/Medicine.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

function formatMedicine(doc: any) {
  return {
    id: doc.legacyId,
    _id: doc._id,
    brandName: doc.brandName,
    brandManufacturer: doc.brandManufacturer,
    brandPrice: doc.brandPrice,
    activeIngredient: doc.activeIngredient,
    category: doc.category,
    treatmentFor: doc.treatmentFor,
    rxRequired: doc.rxRequired,
    description: doc.description,
    dosageInstructions: doc.dosageInstructions,
    commonSideEffects: doc.commonSideEffects,
    precautions: doc.precautions,
    storageAdvice: doc.storageAdvice,
    suggestedGenerics: (doc.suggestedGenerics || [])
      .filter((g: any) => g.status === 'active' && g.mappingStatus === 'approved')
      .map(formatGeneric),
  };
}

function formatGeneric(g: any) {
  return {
    id: g._id.toString(),
    name: g.name,
    manufacturer: g.manufacturer,
    price: g.price,
    packSize: g.packSize,
    dosageForm: g.dosageForm,
    strength: g.strength,
    savingsPercentage: g.savingsPercentage,
    fdaApproved: g.fdaApproved,
    whoGmpCertified: g.whoGmpCertified,
    labTested: g.labTested,
    inStock: g.inStock,
    rating: g.rating,
    ratingCount: g.ratingCount,
    deliveryEta: g.deliveryEta,
  };
}

/**
 * GET /api/medicines
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, rxRequired, sortBy = 'brandName', page = '1', limit = '50' } = req.query as Record<string, string>;

    const filter: any = { status: 'active' };
    if (category && category !== 'all') filter.category = category;
    if (rxRequired === 'true') filter.rxRequired = true;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));

    const [docs, total] = await Promise.all([
      Medicine.find(filter).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      Medicine.countDocuments(filter),
    ]);

    let medicines = docs.map(formatMedicine);

    // Sort
    if (sortBy === 'savings') {
      medicines.sort((a, b) => {
        const ag = a.suggestedGenerics[0], bg = b.suggestedGenerics[0];
        if (!ag || !bg) return 0;
        return ((b.brandPrice - bg.price) / b.brandPrice) - ((a.brandPrice - ag.price) / a.brandPrice);
      });
    } else if (sortBy === 'price-asc') {
      medicines.sort((a, b) => (a.suggestedGenerics[0]?.price ?? 999) - (b.suggestedGenerics[0]?.price ?? 999));
    } else if (sortBy === 'rating') {
      medicines.sort((a, b) => (b.suggestedGenerics[0]?.rating ?? 0) - (a.suggestedGenerics[0]?.rating ?? 0));
    }

    res.json({
      success: true,
      data: { medicines, total, page: pageNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) { next(error); }
});

/**
 * GET /api/medicines/:id  — id can be legacyId (string) or _id (ObjectId)
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const doc = await Medicine.findOne({
      $or: [{ legacyId: id }, ...(id.match(/^[a-f\d]{24}$/i) ? [{ _id: id }] : [])],
    }).lean();

    if (!doc) throw new AppError(404, 'NOT_FOUND', `Medicine '${id}' not found`);

    res.json({ success: true, data: formatMedicine(doc) });
  } catch (error) { next(error); }
});

/**
 * GET /api/medicines/:id/alternatives
 */
router.get('/:id/alternatives', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await Medicine.findOne({ legacyId: req.params.id }).lean();
    if (!doc) throw new AppError(404, 'NOT_FOUND', `Medicine '${req.params.id}' not found`);

    const generics = (doc.suggestedGenerics || [])
      .filter((g: any) => g.status === 'active' && g.mappingStatus === 'approved')
      .map(formatGeneric);

    res.json({ success: true, data: { medicineId: req.params.id, alternatives: generics, total: generics.length } });
  } catch (error) { next(error); }
});

export default router;
export { formatMedicine, formatGeneric };
