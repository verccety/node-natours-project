const Tour = require('../models/tourModel');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

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
      message: 'Invalid data sent!', //do not use in production like that!
    });
  }
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
