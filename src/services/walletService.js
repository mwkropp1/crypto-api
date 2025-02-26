import sql from '../database/config.js';
import axios from 'axios';
import { ApiError } from '../middleware/errorMiddleware.js';

const base_url = process.env.COINCAP_API_URL;

export const saveWallet = async (userId, name) => {
  const [results] = await sql.query('INSERT INTO wallets (user_id, name) VALUES (?, ?)', [
    userId,
    name
  ]);
  return { walletId: results.insertId, userId, name };
};

export const findWalletsByUser = async (userId) => {
  const [results] = await sql.query(
    'SELECT wallet_id, name, created_at FROM wallets WHERE user_id = ?',
    [userId]
  );
  return results;
};

export const findWalletById = async (walletId, userId) => {
  const [results] = await sql.query(
    'SELECT wallet_id, name, created_at FROM wallets WHERE wallet_id = ? AND user_id = ?',
    [walletId, userId]
  );
  return results[0];
};

export const saveHolding = async (walletId, userId, assetId, amount) => {
  const [walletResults] = await sql.query(
    'SELECT wallet_id FROM wallets WHERE wallet_id = ? AND user_id = ?',
    [walletId, userId]
  );

  if (!walletResults.length) {
    throw new ApiError(404, 'Wallet not found or unauthorized');
  }

  const response = await axios.get(`${base_url}/assets/${assetId.toLowerCase()}`);
  const currentPrice = parseFloat(response.data.data.priceUsd);

  const [existingHolding] = await sql.query(
    'SELECT amount, avg_price_usd FROM holdings WHERE wallet_id = ? AND asset_id = ?',
    [walletId, assetId.toLowerCase()]
  );

  // use an average price so that we can later calculate gains/losses
  if (existingHolding.length > 0) {
    const exAmt = parseFloat(existingHolding[0].amount);
    const exAvgPrice = parseFloat(existingHolding[0].avg_price_usd);
    const totalAmount = exAmt + amount;
    const totalValue = exAmt * exAvgPrice + amount * currentPrice;
    const newAvgPrice = totalValue / totalAmount;

    const [results] = await sql.query(
      'UPDATE holdings SET amount = ?, avg_price_usd = ? WHERE wallet_id = ? AND asset_id = ?',
      [totalAmount, newAvgPrice, walletId, assetId.toLowerCase()]
    );
    return { walletId, assetId, amount: totalAmount, avgPriceUsd: newAvgPrice };
  }

  const [results] = await sql.query(
    'INSERT INTO holdings (wallet_id, asset_id, amount, avg_price_usd) VALUES (?, ?, ?, ?)',
    [walletId, assetId.toLowerCase(), amount, currentPrice]
  );
  return { walletId, assetId, amount, avgPriceUsd: currentPrice };
};

export const updateHoldingById = async (walletId, userId, assetId, newAmount) => {
  const [walletResults] = await sql.query(
    'SELECT wallet_id FROM wallets WHERE wallet_id = ? AND user_id = ?',
    [walletId, userId]
  );

  if (!walletResults.length) {
    throw new ApiError(404, 'Wallet not found or unauthorized');
  }

  const [currentHolding] = await sql.query(
    'SELECT amount, avg_price_usd FROM holdings WHERE wallet_id = ? AND asset_id = ?',
    [walletId, assetId.toLowerCase()]
  );

  if (!currentHolding.length) {
    throw new ApiError(404, 'Holding not found');
  }

  if (newAmount === 0) {
    await sql.query('DELETE FROM holdings WHERE wallet_id = ? AND asset_id = ?', [
      walletId,
      assetId.toLowerCase()
    ]);
    return { walletId, assetId, amount: 0 };
  }

  const [results] = await sql.query(
    'UPDATE holdings SET amount = ? WHERE wallet_id = ? AND asset_id = ?',
    [newAmount, walletId, assetId.toLowerCase()]
  );

  if (results.affectedRows === 0) {
    throw new ApiError(404, 'Failed to update holding');
  }

  return {
    walletId,
    assetId,
    amount: newAmount,
    avgPriceUsd: currentHolding[0].avg_price_usd
  };
};

export const removeHolding = async (walletId, userId, assetId) => {
  const [walletResults] = await sql.query(
    'SELECT wallet_id FROM wallets WHERE wallet_id = ? AND user_id = ?',
    [walletId, userId]
  );

  if (!walletResults.length) {
    throw new ApiError(404, 'Wallet not found or unauthorized');
  }

  const [results] = await sql.query('DELETE FROM holdings WHERE wallet_id = ? AND asset_id = ?', [
    walletId,
    assetId.toLowerCase()
  ]);

  if (results.affectedRows === 0) {
    throw new ApiError(404, 'Holding not found');
  }
};

export const findWalletHoldings = async (walletId, userId) => {
  const [walletResults] = await sql.query(
    'SELECT wallet_id FROM wallets WHERE wallet_id = ? AND user_id = ?',
    [walletId, userId]
  );

  if (!walletResults.length) {
    throw new ApiError(404, 'Wallet not found or unauthorized');
  }

  const [results] = await sql.query(
    'SELECT holding_id, asset_id, amount, updated_at FROM holdings WHERE wallet_id = ?',
    [walletId]
  );
  return results;
};

export const calculateWalletValue = async (walletId, userId) => {
  const [walletResults] = await sql.query(
    'SELECT wallet_id FROM wallets WHERE wallet_id = ? AND user_id = ?',
    [walletId, userId]
  );

  if (!walletResults.length) {
    throw new ApiError(404, 'Wallet not found or unauthorized');
  }

  const [holdings] = await sql.query('SELECT asset_id, amount FROM holdings WHERE wallet_id = ?', [
    walletId
  ]);

  let totalValue = 0;
  for (const holding of holdings) {
    try {
      const response = await axios.get(`${base_url}/assets/${holding.asset_id}`);
      const currentPrice = parseFloat(response.data.data.priceUsd);
      totalValue += currentPrice * holding.amount;
    } catch (error) {
      throw new ApiError(503, `Error fetching price for ${holding.asset_id}`);
    }
  }

  return totalValue;
};

export const calculateGainsLosses = async (walletId, userId) => {
  const [walletResults] = await sql.query(
    'SELECT wallet_id FROM wallets WHERE wallet_id = ? AND user_id = ?',
    [walletId, userId]
  );

  if (!walletResults.length) {
    throw new ApiError(404, 'Wallet not found or unauthorized');
  }

  const [holdings] = await sql.query(
    'SELECT asset_id, amount, avg_price_usd FROM holdings WHERE wallet_id = ?',
    [walletId]
  );

  let totalCurrentValue = 0;
  let totalPurchaseValue = 0;

  for (const holding of holdings) {
    try {
      const currentResponse = await axios.get(
        `${base_url}/assets/${holding.asset_id.toLowerCase()}`
      );
      const currentPrice = parseFloat(currentResponse.data.data.priceUsd);
      totalCurrentValue += currentPrice * holding.amount;

      const historicalPrice = parseFloat(holding.avg_price_usd);
      totalPurchaseValue += historicalPrice * holding.amount;
    } catch (error) {
      throw new ApiError(503, `Error fetching price data for ${holding.asset_symbol}`);
    }
  }

  return {
    currentValue: totalCurrentValue,
    purchaseValue: totalPurchaseValue,
    gainLoss: totalCurrentValue - totalPurchaseValue,
    gainLossPercentage: ((totalCurrentValue - totalPurchaseValue) / totalPurchaseValue) * 100,
    timestamp: new Date()
  };
};
