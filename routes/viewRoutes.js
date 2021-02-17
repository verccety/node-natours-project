import express from 'express';
import * as viewsController from '../controllers/viewsController.js';

const router = express.Router();

router.get('/', viewsController.getOverview);
router.get('/tour', viewsController.getTour);

export default router;