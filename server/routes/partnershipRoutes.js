import express from 'express';
import {
  getPartnerships,
  getPartnershipById,
  createPartnership,
  updatePartnershipStatus,
} from '../controllers/partnershipController.js';
import { protect } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

router.route('/')
  .get(getPartnerships)
  .post(protect, createPartnership);

router.route('/:id')
  .get(validateObjectId('id'), getPartnershipById);

router.route('/:id/status')
  .patch(protect, validateObjectId('id'), updatePartnershipStatus);

export default router;
