import express from 'express';
import { getAssets, getAssetById, convertAsset } from '../controllers/assetController.js';

const router = express.Router();

// these routes don't need authentication
router.get('/', getAssets);
router.get('/:id', getAssetById);
router.get('/:id/convert', convertAsset);

export default router;
