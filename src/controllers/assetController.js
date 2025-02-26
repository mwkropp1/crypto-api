import axios from 'axios';
import { ApiError } from '../middleware/errorMiddleware.js';

const base_url = process.env.COINCAP_API_URL;

export const getAssets = async (req, res, next) => {
  try {
    // could enhance with more filter options than price
    const {
      id = '',
      symbol = '',
      limit = 20,
      offset = 0,
      sort = 'rank',
      order = 'asc',
      minPrice,
      maxPrice
    } = req.query;

    // validate query parameters, could enhance
    if (limit > 2000) {
      throw new ApiError(400, 'Maximum limit is 2000');
    }
    if (symbol && id) {
      throw new ApiError(400, 'Only one of symbol or id allowed');
    }

    const queryParams = {
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    if (symbol) queryParams.search = symbol;
    if (id) queryParams.ids = id;

    const response = await axios
      .get(`${base_url}/assets`, {
        params: queryParams
      })
      .catch((error) => {
        throw new ApiError(503, 'CoinCap API not available');
      });

    // modify results in wrapper api since coincap doesn't have filter / sort
    let filteredData = filterAssets(response.data.data, { minPrice, maxPrice });
    let sortedData = sortAssets(filteredData, sort, order);

    const totalResults = sortedData.length;

    // provide some metadata a UI may use
    res.json({
      data: sortedData,
      pagination: {
        currentPage: Math.floor(offset / limit) + 1,
        perPage: parseInt(limit),
        total: totalResults,
        totalPages: Math.ceil(totalResults / limit)
      },
      filters: {
        symbol: symbol || null,
        id: id || null,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null
      },
      sort: {
        field: sort,
        order
      }
    });
  } catch (error) {
    next(error);
  }
};

const sortAssets = (assets, sort = 'rank', order = 'asc') => {
  return assets.sort((a, b) => {
    const aValue = parseFloat(a[sort]) || a[sort];
    const bValue = parseFloat(b[sort]) || b[sort];
    return order === 'asc' ? (aValue > bValue ? 1 : -1) : aValue < bValue ? 1 : -1;
  });
};

const filterAssets = (assets, { minPrice, maxPrice }) => {
  return assets.filter((asset) => {
    const price = parseFloat(asset.priceUsd);
    const meetsMinPrice = !minPrice || price >= parseFloat(minPrice);
    const meetsMaxPrice = !maxPrice || price <= parseFloat(maxPrice);
    return meetsMinPrice && meetsMaxPrice;
  });
};

export const getAssetById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${base_url}/assets/${id}`).catch((error) => {
      if (error.response?.status === 404) {
        throw new ApiError(404, 'Asset not found');
      }
      throw new ApiError(503, 'CoinCap API not available');
    });

    res.json(response.data);
  } catch (error) {
    next(error);
  }
};

export const convertAsset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount = 1 } = req.query;

    if (isNaN(amount) || amount <= 0) {
      throw new ApiError(400, 'Amount must be a positive number');
    }

    const response = await axios.get(`${base_url}/assets/${id}`).catch((error) => {
      if (error.response?.status === 404) {
        throw new ApiError(404, 'Asset not found');
      }
      throw new ApiError(503, 'CoinCap API not available');
    });

    const { priceUsd } = response.data.data;
    const convertedAmount = parseFloat(amount) * parseFloat(priceUsd);

    res.json({
      asset: id,
      amount: parseFloat(amount),
      priceUsd: parseFloat(priceUsd),
      convertedAmount,
      currency: 'USD'
    });
  } catch (error) {
    next(error);
  }
};
