/**
 * GENERICMED Backend Server — MongoDB edition
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load .env before anything else
config();

import { connectDatabase } from './db/database.js';
import { seedDatabase } from './db/seed.js';
import medicineRoutes from './routes/medicines.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import prescriptionRoutes from './routes/prescriptions.js';
import scanAiRoutes from './routes/scanAi.js';
import deliveryRoutes from './routes/delivery.js';
import searchRoutes from './routes/search.js';
import auditRoutes from './routes/audit.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { rateLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(rateLimiter);

// Static file serving for uploaded prescriptions
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/medicines', medicineRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/prescriptions/scan-ai', scanAiRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/audit', auditRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'healthy', timestamp: new Date().toISOString(), version: '2.0.0', db: 'mongodb' } });
});

app.use(errorHandler);

// ─── Server Start ────────────────────────────────────────────────────────────
async function startServer() {
  try {
    await connectDatabase();
    await seedDatabase();
    console.log('✅ Database seeded');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 GENERICMED API Server (MongoDB) → http://localhost:${PORT}`);
      console.log(`📋 Health: http://localhost:${PORT}/api/health`);
      console.log(`💊 Medicines: http://localhost:${PORT}/api/medicines`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
export default app;
