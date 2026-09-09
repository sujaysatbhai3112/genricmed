/**
 * Delivery options routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { DeliveryOption } from '../models/DeliveryOption.js';

const router = Router();

/** GET /api/delivery/options */
router.get('/options', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const options = await DeliveryOption.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    res.json({
      success: true,
      data: {
        options: options.map((opt) => ({
          id: opt.optionId,
          name: opt.name,
          estimatedTime: opt.estimatedTime,
          price: opt.price,
          badge: opt.badge,
        })),
      },
    });
  } catch (error) { next(error); }
});

export default router;
