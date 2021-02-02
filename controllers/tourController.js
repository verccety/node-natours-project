import Tour from '../models/tourModel.js';
import APIFeatures from '../utils/apiFeatures.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

export function aliasTopTours(request, response, next) {
  request.query.limit = '5';
  request.query.sort = '-ratingsAverage, price';
  request.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
}

export const getAllTours = catchAsync(async (request, response, next) => {
  //const query = await Tour.find ().where('duration').equals(5) - один из способов фильтрации
  // EXECURE QUERY
  const features = new APIFeatures(Tour.find(), request.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  // SEND RESPONSE
  response.status(200).json({
    status: 'success',
    results: tours.length, // best practice, not necessary, for mult. obj in array
    data: {
      tours,
    },
  });
});

export const getTour = catchAsync(async (request, response, next) => {
  const tour = await Tour.findById(request.params.id); // equal to Tour.findOne({id: request.params.id})

  if (!tour) {
    return next(new AppError('No tour found with that id', 404));
  }

  response.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

export const createTour = catchAsync(async (request, response, next) => {
  const newTour = await Tour.create(request.body);
  response.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

export const updateTour = catchAsync(async (request, response, next) => {
  const tour = await Tour.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return next(new AppError('No tour found with that id', 404));
  }

  response.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

export const deleteTour = catchAsync(async (request, response, next) => {
  const tour = await Tour.findByIdAndDelete(request.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that id', 404));
  }
  response.status(204).json({
    status: 'success',
    data: undefined,
  });
});

export const getTourStats = catchAsync(async (request, response, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  response.status(200).json({
    status: 'success',
    data: stats,
  });
});

export const getMonthlyPlan = catchAsync(async (request, response, next) => {
  const year = request.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  response.status(200).json({
    status: 'success',
    data: plan,
  });
});
