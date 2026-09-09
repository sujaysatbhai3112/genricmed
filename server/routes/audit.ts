/**
 * Audit routes — FR-ADM-04 (read-only)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { AuditEvent } from '../models/AuditEvent.js';

const router = Router();

/** GET /api/audit */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { action, targetType, targetId, startDate, endDate, page = '1', limit = '50' } = req.query as Record<string, string>;

    const filter: any = {};
    if (action) filter.action = action;
    if (targetType) filter.targetType = targetType;
    if (targetId) filter.targetId = targetId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));

    const [events, total] = await Promise.all([
      AuditEvent.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      AuditEvent.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        events: events.map((e) => ({
          id: e._id.toString(),
          actorId: e.actorId,
          actorRole: e.actorRole,
          action: e.action,
          targetType: e.targetType,
          targetId: e.targetId,
          details: e.details,
          ipAddress: e.ipAddress,
          createdAt: e.createdAt,
        })),
        pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
      },
    });
  } catch (error) { next(error); }
});

export default router;
