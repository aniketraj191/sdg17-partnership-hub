import express from 'express';
import {
  getOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from '../controllers/organizationController.js';
import { protect } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

router.route('/')
  .get(getOrganizations)
  .post(protect, createOrganization);

router.route('/:id')
  .get(validateObjectId('id'), getOrganizationById)
  .put(protect, validateObjectId('id'), updateOrganization)
  .delete(protect, validateObjectId('id'), deleteOrganization);

export default router;
