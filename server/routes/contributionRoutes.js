import express from 'express';
import {
  getContributions,
  getContributionById,
  createContribution,
  updateContribution,
  deleteContribution,
} from '../controllers/contributionController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

router.route('/')
  .get(getContributions)
  .post(optionalAuth, createContribution);

router.route('/:id')
  .get(validateObjectId('id'), getContributionById)
  .put(protect, validateObjectId('id'), updateContribution)
  .delete(protect, validateObjectId('id'), deleteContribution);

export default router;
