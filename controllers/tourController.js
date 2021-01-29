const Tour = require('../models/tourModel');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.getAllTours = async (request, response) => {
  try {
    // BUILD QUERY
    // 1) Filtering
    const queryObject = { ...request.query };
    const excludedField = ['page', 'sort', 'limit', 'fields'];
    excludedField.forEach((element) => delete queryObject[element]);

    // 2) Advanced filtering
    let queryString = JSON.stringify(queryObject);
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (match) => `$${match}`
    );

    const query = Tour.find(JSON.parse(queryString)); // сохраняем сначала в query, а не сразу в document, чтобы иметь восможность chain последующие запросы
    //const query = await Tour.find ().where('duration').equals(5) - один из способов фильтрации
    // EXECURE QUERY
    const tours = await query;

    // SEND RESPONSE
    response.status(200).json({
      status: 'success',
      results: tours.length, // best practice, not necessary, for mult. obj in array
      data: {
        tours,
      },
    });
  } catch (error) {
    response.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.getTour = async (request, response) => {
  try {
    const tour = await Tour.findById(request.params.id); // equal to Tour.findOne({id: request.params.id})
    response.status(200).json({
      status: 'success',
      results: tour.length, // best practice, not necessary, for mult. obj in array
      data: {
        tour,
      },
    });
  } catch (error) {
    response.status(404).json({
      status: 'fail',
      message: error,
    });
  }

  // response.status(200).json({
  //   status: 'success',
  //   requestedAt: request.requestTime,
  //   data: {
  //     tour,
  //   },
  // });
};

exports.createTour = async (request, response) => {
  try {
    const newTour = await Tour.create(request.body);
    response.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    response.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.updateTour = async (request, response) => {
  try {
    const tour = await Tour.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    });
    response.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    response.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.deleteTour = async (request, response) => {
  try {
    await Tour.findByIdAndDelete(request.params.id);
    response.status(204).json({
      status: 'success',
      data: undefined,
    });
  } catch (error) {
    response.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};
