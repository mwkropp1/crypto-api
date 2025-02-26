import express from 'express';
import {
  createWallet,
  getWallets,
  getWalletById,
  addHolding,
  updateHolding,
  deleteHolding,
  getWalletHoldings,
  getWalletValue,
  getWalletGainsLosses
} from '../controllers/walletController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// JWT token has to be verified for all routes
router.post('/', verifyToken, createWallet);
router.get('/', verifyToken, getWallets);
router.get('/:walletId', verifyToken, getWalletById);

router.post('/:walletId/holdings', verifyToken, addHolding);
router.put('/:walletId/holdings/:assetId', verifyToken, updateHolding);
router.delete('/:walletId/holdings/:assetId', verifyToken, deleteHolding);
router.get('/:walletId/holdings', verifyToken, getWalletHoldings);

router.get('/:walletId/value', verifyToken, getWalletValue);
router.get('/:walletId/gains-losses', verifyToken, getWalletGainsLosses);

export default router;
