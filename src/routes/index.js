import express from 'express';

import authRoutes from './authRoutes.js';
import assetRoutes from './assetRoutes.js';
import walletRoutes from './walletRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/wallets', walletRoutes);
router.use('/assets', assetRoutes);

export default router;
