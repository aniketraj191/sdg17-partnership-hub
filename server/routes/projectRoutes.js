import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

router.route('/')
  .get(getProjects)
  .post(protect, createProject);

router.route('/:id')
  .get(validateObjectId('id'), getProjectById)
  .put(protect, validateObjectId('id'), updateProject)
  .delete(protect, validateObjectId('id'), deleteProject);

export default router;
