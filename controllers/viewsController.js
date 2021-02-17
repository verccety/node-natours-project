import Tour from '../models/tourModel.js';
import catchAsync from '../utils/catchAsync.js';

export const getOverview = catchAsync(async (request, response, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();
  // 2) Build tempalate

  // 3) Render template
  response.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

export const getTour = (request, response) => {
  response.status(200).render('tour', {
    title: 'The Forest Hiker Tour',
  });
};
