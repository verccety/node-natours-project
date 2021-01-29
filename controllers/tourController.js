const Tour = require('../models/tourModel');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.aliasTopTours = (request, response, next) => {
  request.query.limit = '5';
  request.query.sort = '-ratingsAverage, price';
  request.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (request, response) => {
  try {
    // BUILD QUERY
    // 1A) Filtering
    const queryObject = { ...request.query };
    const excludedField = ['page', 'sort', 'limit', 'fields'];
    excludedField.forEach((element) => delete queryObject[element]);

    // 1B) Advanced filtering
    let queryString = JSON.stringify(queryObject);
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (match) => `$${match}`
    );
    let query = Tour.find(JSON.parse(queryString)); // сохраняем сначала в query, а не сразу в document, чтобы иметь восможность chain последующие запросы

    //2) Sorting
    if (request.query.sort) {
      const sortBy = request.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    //3) Field limiting
    if (request.query.fields) {
      const fields = request.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    //4) Pagination
    const page = request.query.page * 1 || 1;
    const limit = request.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (request.query.page) {
      const numberTours = await Tour.countDocuments();
      if (skip >= numberTours) throw new Error('This page does not exist');
    }

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
