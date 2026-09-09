/**
 * AI Prescription Scanner — POST /api/prescriptions/scan-ai
 */

import { Router, Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from '@google/genai';
import multer from 'multer';
import { Medicine } from '../models/Medicine.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new AppError(400, 'INVALID_FILE_TYPE', 'Only JPEG, PNG, WebP, and PDF files are accepted') as any);
  },
});

router.post('/', upload.single('prescription'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    if (!file) throw new AppError(400, 'NO_FILE', 'No prescription file provided');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      throw new AppError(503, 'AI_UNAVAILABLE', 'Gemini API key not configured. Set GEMINI_API_KEY in .env');
    }

    const ai = new GoogleGenAI({ apiKey });
    const base64Data = file.buffer.toString('base64');
    const mimeType = file.mimetype as 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf';

    const prompt = `You are a clinical pharmacist AI. Analyze the prescription image and extract structured information.

Return ONLY a valid JSON object with this exact schema (no markdown, no explanation):
{
  "doctorName": "string or empty string",
  "clinicName": "string or empty string",
  "date": "string or empty string",
  "medicines": [
    {
      "brandName": "exact brand name as written on prescription",
      "saltName": "active pharmaceutical ingredient / generic salt name",
      "dosage": "dosage and frequency as written"
    }
  ]
}

Rules:
- Extract every drug written on the prescription
- For saltName, infer the INN/generic name even if not written explicitly
- If the image is not a prescription, return empty medicines array
- Never add extra fields`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: prompt },
        ],
      }],
    });

    const rawText = response.text ?? '';

    let parsed: { doctorName: string; clinicName: string; date: string; medicines: any[] };
    try {
      const clean = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      throw new AppError(502, 'AI_PARSE_ERROR', 'Failed to parse AI response. Please try again.');
    }

    // Match each drug against MongoDB medicines
    const detectedMedicines = await Promise.all(
      (parsed.medicines || []).map(async (drug: any) => {
        const brandName: string = drug.brandName ?? '';
        const saltName: string = drug.saltName ?? '';

        let med: any = null;

        if (brandName) {
          const re = new RegExp(brandName.split(' ')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
          med = await Medicine.findOne({ status: 'active', brandName: re }).lean();
        }
        if (!med && saltName) {
          const re = new RegExp(saltName.split(' ')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
          med = await Medicine.findOne({ status: 'active', activeIngredient: re }).lean();
        }

        const gen = med?.suggestedGenerics?.find((g: any) => g.status === 'active' && g.mappingStatus === 'approved');
        const brandPrice = med?.brandPrice ?? 0;
        const genericPrice = gen?.price ?? 0;

        return {
          prescribedBrand: brandName || saltName,
          saltDetected: saltName || med?.activeIngredient || '',
          matchedMedicineId: med?.legacyId ?? null,
          recommendedGeneric: gen?.name ?? '',
          brandPrice,
          genericPrice,
          savings: Math.round(Math.max(0, brandPrice - genericPrice) * 100) / 100,
          selected: !!med,
        };
      })
    );

    res.json({
      success: true,
      data: {
        doctorName: parsed.doctorName ?? '',
        clinicName: parsed.clinicName ?? '',
        date: parsed.date ?? '',
        detectedMedicines,
        rawText,
      },
    });
  } catch (error) { next(error); }
});

export default router;
