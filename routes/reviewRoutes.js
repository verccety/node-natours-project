import express from 'express';
import * as authController from '../controllers/authController.js';
import * as reviewController from '../controllers/reviewController.js';

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.getAllReviews
  )
  .post(reviewController.createReview);

export default router;
