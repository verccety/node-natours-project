const Tour = require('../models/tourModel');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.checkBody = (request, response, next) => {
  const existingProperties = request.body.name && request.body.price;
  if (!existingProperties) {
    return response.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }
  next();
};

exports.getAllTours = (request, response) => {
  response.status(200).json({
    status: 'success',
    // results: tours.length, // best practice, not necessary, for mult. obj in array
    // data: {
    //   tours: tours,
    // },
  });
};

exports.getTour = (request, response) => {
  const id = request.params.id * 1; // умножим на 1 для конвертации в число из строки
  // const tour = tours.find((element) => element.id === id);
  // response.status(200).json({
  //   status: 'success',
  //   requestedAt: request.requestTime,
  //   data: {
  //     tour,
  //   },
  // });
};

exports.createTour = (request, response) => {
  response.status(201).json({
    status: 'success',
    // data: {
    //   tour: newTour,
    // },
  });
};

exports.updateTour = (request, response) => {
  response.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>',
    },
  });
};

exports.deleteTour = (request, response) => {
  response.status(204).json({
    status: 'success',
    data: undefined,
  });
};
