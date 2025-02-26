import {
  saveWallet,
  findWalletsByUser,
  findWalletById,
  saveHolding,
  updateHoldingById,
  removeHolding,
  findWalletHoldings,
  calculateWalletValue,
  calculateGainsLosses
} from '../services/walletService.js';
import { ApiError } from '../middleware/errorMiddleware.js';

export const createWallet = async (req, res, next) => {
  try {
    const { name } = req.body;
    // taken from JWT token
    const userId = req.user.id;

    if (!name) {
      throw new ApiError(400, 'Wallet name is required');
    }

    const wallet = await saveWallet(userId, name);
    res.status(201).json(wallet);
  } catch (error) {
    next(error);
  }
};

export const getWallets = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const wallets = await findWalletsByUser(userId);
    res.json(wallets);
  } catch (error) {
    next(error);
  }
};

export const getWalletById = async (req, res, next) => {
  try {
    const { walletId } = req.params;
    const userId = req.user.id;
    const wallet = await findWalletById(walletId, userId);

    if (!wallet) {
      throw new ApiError(404, 'Wallet not found');
    }

    res.json(wallet);
  } catch (error) {
    next(error);
  }
};

export const addHolding = async (req, res, next) => {
  try {
    const { walletId } = req.params;
    const { assetId, amount } = req.body;
    const userId = req.user.id;

    if (!assetId || !amount) {
      throw new ApiError(400, 'Asset ID and amount are required');
    }

    if (isNaN(amount) || amount <= 0) {
      throw new ApiError(400, 'Amount must be a positive number');
    }

    const holding = await saveHolding(walletId, userId, assetId, amount);
    res.status(201).json(holding);
  } catch (error) {
    next(error);
  }
};

export const updateHolding = async (req, res, next) => {
  try {
    const { walletId, assetId } = req.params;
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount) {
      throw new ApiError(400, 'Amount is required');
    }

    if (isNaN(amount) || amount < 0) {
      throw new ApiError(400, 'Amount must be a non-negative number');
    }

    const holding = await updateHoldingById(walletId, userId, assetId, amount);
    res.json(holding);
  } catch (error) {
    next(error);
  }
};

export const deleteHolding = async (req, res, next) => {
  try {
    const { walletId, assetId } = req.params;
    const userId = req.user.id;
    await removeHolding(walletId, userId, assetId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getWalletHoldings = async (req, res, next) => {
  try {
    const { walletId } = req.params;
    const userId = req.user.id;
    const holdings = await findWalletHoldings(walletId, userId);
    res.json(holdings);
  } catch (error) {
    next(error);
  }
};

export const getWalletValue = async (req, res, next) => {
  try {
    const { walletId } = req.params;
    const userId = req.user.id;

    const value = await calculateWalletValue(walletId, userId);
    res.json({
      walletId,
      totalValueUSD: value,
      timestamp: new Date()
    });
  } catch (error) {
    next(error);
  }
};

export const getWalletGainsLosses = async (req, res, next) => {
  try {
    const { walletId } = req.params;
    const userId = req.user.id;

    const gainsLosses = await calculateGainsLosses(walletId, userId);
    res.json({
      walletId,
      ...gainsLosses,
      timestamp: new Date()
    });
  } catch (error) {
    next(error);
  }
};
