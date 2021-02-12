import mongoose from 'mongoose';
// import slugify from 'slugify';
// import validator from 'validator';
import Tour from './tourModel.js';

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review must have a description'],
    },
    rating: {
      type: Number,
      required: [true, 'A review must have a rating'],
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },

    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    // send only relevant data to prevent ant leaks
    select: 'name photo',
  });
  /*.populate({
    path: 'tour',
    select: 'name',
  });*/

  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        // tour ID - common field all reviews have in common to group by
        _id: 'tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // this - current doc, constructor - model who created it;
  // this.tour - tour Id field on review doc
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  // pass data from pre- to post-middleware
  this.reviewDocument = await this.findOne();
  next();
});

// or simply pass doc to post-, no need for pre- (post-middleware gets the doc as an argument)
/* reviewSchema.post(/^findOneAnd/, async function(doc) {
//   await doc.constructor.calcAverageRatings(doc.tour); }); */

reviewSchema.post(/^findOneAnd/, async function () {
  await this.reviewDocument.constructor.calcAverageRatings(
    this.reviewDocument.tour
  );
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
