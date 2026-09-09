/**
 * Search routes — FR-SEARCH-01 to FR-SEARCH-05
 */

import { Router, Request, Response, NextFunction } from 'express';
import { Medicine } from '../models/Medicine.js';
import { formatMedicine } from './medicines.js';

const router = Router();

/**
 * GET /api/search?q=...
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q = '', category, rxRequired, sortBy = 'relevance' } = req.query as Record<string, string>;
    const searchTerm = q.trim();

    const filter: any = { status: 'active' };
    if (category && category !== 'all') filter.category = category;
    if (rxRequired === 'true') filter.rxRequired = true;

    let docs: any[];

    if (!searchTerm) {
      docs = await Medicine.find(filter).lean();
    } else {
      // Try MongoDB text search first; fall back to regex if no text index hit
      const textResults = await Medicine.find(
        { ...filter, $text: { $search: searchTerm } },
        { score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' } }).lean();

      if (textResults.length > 0) {
        docs = textResults;
      } else {
        // Regex fallback for partial matches
        const re = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        docs = await Medicine.find({
          ...filter,
          $or: [
            { brandName: re },
            { activeIngredient: re },
            { brandManufacturer: re },
            { treatmentFor: re },
            { 'suggestedGenerics.name': re },
            { 'suggestedGenerics.manufacturer': re },
          ],
        }).lean();
      }
    }

    let results = docs.map(formatMedicine);

    // Client-requested sort
    if (sortBy === 'savings') {
      results.sort((a, b) => {
        const ag = a.suggestedGenerics[0], bg = b.suggestedGenerics[0];
        if (!ag || !bg) return 0;
        return ((b.brandPrice - bg.price) / b.brandPrice) - ((a.brandPrice - ag.price) / a.brandPrice);
      });
    } else if (sortBy === 'price-asc') {
      results.sort((a, b) => (a.suggestedGenerics[0]?.price ?? 999) - (b.suggestedGenerics[0]?.price ?? 999));
    } else if (sortBy === 'rating') {
      results.sort((a, b) => (b.suggestedGenerics[0]?.rating ?? 0) - (a.suggestedGenerics[0]?.rating ?? 0));
    }

    res.json({ success: true, data: { query: searchTerm, results, totalResults: results.length } });
  } catch (error) { next(error); }
});

/**
 * GET /api/search/suggestions?q=...
 */
router.get('/suggestions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = ((req.query.q as string) || '').trim();
    if (!q || q.length < 2) {
      res.json({ success: true, data: { suggestions: [] } });
      return;
    }

    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const docs = await Medicine.find(
      { status: 'active', $or: [{ brandName: re }, { activeIngredient: re }, { 'suggestedGenerics.name': re }] },
      { brandName: 1, activeIngredient: 1, 'suggestedGenerics.name': 1 }
    ).limit(20).lean();

    const suggestions: { suggestion: string; type: string }[] = [];
    const seen = new Set<string>();

    for (const doc of docs) {
      if (!seen.has(doc.brandName)) { suggestions.push({ suggestion: doc.brandName, type: 'brand' }); seen.add(doc.brandName); }
      if (!seen.has(doc.activeIngredient)) { suggestions.push({ suggestion: doc.activeIngredient, type: 'ingredient' }); seen.add(doc.activeIngredient); }
      for (const g of doc.suggestedGenerics || []) {
        if (!seen.has(g.name)) { suggestions.push({ suggestion: g.name, type: 'generic' }); seen.add(g.name); }
      }
    }

    res.json({ success: true, data: { suggestions: suggestions.slice(0, 10) } });
  } catch (error) { next(error); }
});

export default router;
