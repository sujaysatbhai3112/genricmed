/**
 * Prescription routes — FR-RX-01 to FR-RX-04
 */

import { Router, Request, Response, NextFunction } from 'express';
import { Prescription } from '../models/Prescription.js';
import { AuditEvent } from '../models/AuditEvent.js';
import { AppError } from '../middleware/errorHandler.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = Router();
const DEFAULT_SESSION = 'default';

const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'prescriptions');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `rx-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new AppError(400, 'INVALID_FILE_TYPE', 'Only JPEG, PNG, WebP, and PDF files are accepted') as any);
  },
});

/** POST /api/prescriptions/upload */
router.post('/upload', upload.single('prescription'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    const sessionId = (req.body.sessionId as string) || DEFAULT_SESSION;
    const orderId = req.body.orderId || null;
    if (!file) throw new AppError(400, 'NO_FILE', 'No prescription file uploaded');

    const rx = await Prescription.create({
      sessionId,
      orderId: orderId || undefined,
      fileName: file.originalname,
      filePath: file.filename,
      fileType: file.mimetype,
      fileSize: file.size,
      status: 'uploaded',
    });

    await AuditEvent.create({
      actorId: sessionId, actorRole: 'customer',
      action: 'prescription_uploaded', targetType: 'prescription', targetId: rx._id.toString(),
      details: { fileName: file.originalname, fileSize: file.size, fileType: file.mimetype },
    });

    res.status(201).json({
      success: true,
      data: {
        id: rx._id.toString(),
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        status: 'uploaded',
        message: 'Prescription uploaded successfully. It will be reviewed by our pharmacist.',
      },
    });
  } catch (error) { next(error); }
});

/** GET /api/prescriptions */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = (req.query.sessionId as string) || DEFAULT_SESSION;
    const rxs = await Prescription.find({ sessionId }).sort({ createdAt: -1 }).lean();
    res.json({
      success: true,
      data: {
        prescriptions: rxs.map((rx) => ({
          id: rx._id.toString(),
          orderId: rx.orderId?.toString(),
          fileName: rx.fileName,
          fileType: rx.fileType,
          fileSize: rx.fileSize,
          status: rx.status,
          reviewNote: rx.reviewNote,
          reviewedBy: rx.reviewedBy,
          reviewedAt: rx.reviewedAt,
          createdAt: rx.createdAt,
        })),
        total: rxs.length,
      },
    });
  } catch (error) { next(error); }
});

/** GET /api/prescriptions/:id */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rx = await Prescription.findById(req.params.id).lean();
    if (!rx) throw new AppError(404, 'NOT_FOUND', 'Prescription not found');
    res.json({
      success: true,
      data: {
        id: rx._id.toString(),
        orderId: rx.orderId?.toString(),
        fileName: rx.fileName,
        fileUrl: `/uploads/prescriptions/${rx.filePath}`,
        fileType: rx.fileType,
        fileSize: rx.fileSize,
        status: rx.status,
        reviewNote: rx.reviewNote,
        reviewedBy: rx.reviewedBy,
        reviewedAt: rx.reviewedAt,
        createdAt: rx.createdAt,
      },
    });
  } catch (error) { next(error); }
});

/** PATCH /api/prescriptions/:id/review */
router.patch('/:id/review', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, reviewNote, reviewedBy = 'Dr. Emily Vance (Pharm.D)' } = req.body;
    const valid = ['approved', 'rejected', 'clarification_needed'];
    if (!status || !valid.includes(status)) {
      throw new AppError(400, 'INVALID_INPUT', `Status must be one of: ${valid.join(', ')}`);
    }
    if (status === 'rejected' && !reviewNote) {
      throw new AppError(400, 'REASON_REQUIRED', 'A rejection reason is required');
    }

    const rx = await Prescription.findById(req.params.id);
    if (!rx) throw new AppError(404, 'NOT_FOUND', 'Prescription not found');

    rx.status = status;
    rx.reviewNote = reviewNote;
    rx.reviewedBy = reviewedBy;
    rx.reviewedAt = new Date();
    await rx.save();

    await AuditEvent.create({
      actorId: reviewedBy, actorRole: 'pharmacist',
      action: 'prescription_reviewed', targetType: 'prescription', targetId: rx._id.toString(),
      details: { status, reviewNote },
    });

    res.json({ success: true, data: { id: rx._id.toString(), status, reviewedBy, reviewedAt: rx.reviewedAt } });
  } catch (error) { next(error); }
});

export default router;
