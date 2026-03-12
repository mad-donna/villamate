import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { upload, uploadsDir } from './middlewares/upload';
import { startAutoBillingCron, startDunningCron, startSubscriptionExpiryCron } from './cron';
import { migrateRoomNumbers } from './migrations';
import { uploadFile, health, getPayPage, notifyPayment } from './controllers/publicController';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import villaRoutes from './routes/villaRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import paymentRoutes from './routes/paymentRoutes';
import residentRoutes from './routes/residentRoutes';
import postRoutes from './routes/postRoutes';
import vehicleRoutes from './routes/vehicleRoutes';
import pollRoutes from './routes/pollRoutes';
import superAdminRoutes from './routes/superAdminRoutes';
import systemNoticeRoutes from './routes/systemNoticeRoutes';
import faqRoutes from './routes/faqRoutes';
import guideRoutes from './routes/guideRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ─── Global Middlewares ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// ─── Utility Endpoints ────────────────────────────────────────────────────────
app.get('/api/health', health);
app.post('/api/upload', upload.single('file'), uploadFile);

// ─── Public Pages (non-JSON, HTML responses) ─────────────────────────────────
app.get('/pay/:billId', getPayPage);
app.post('/api/public/pay/:billId/notify', notifyPayment);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/villas', villaRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/admin', superAdminRoutes);
app.use('/api/system-notices', systemNoticeRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ─── Cron Jobs ────────────────────────────────────────────────────────────────
startAutoBillingCron();
startDunningCron();
startSubscriptionExpiryCron();

export { app };

if (require.main === module) {
  migrateRoomNumbers();
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
