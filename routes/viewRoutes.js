import express from 'express';
import * as viewsController from '../controllers/viewsController.js';

const router = express.Router();

router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour);

export default router;
