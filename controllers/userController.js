import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

const filterObject = (object, ...allowedFields) => {
  const newObject = {};
  Object.keys(object).forEach((element) => {
    if (allowedFields.includes(element)) newObject[element] = object[element];
  });

  return newObject;
};

export const getAllUsers = catchAsync(async (request, response, next) => {
  const users = await User.find();

  // SEND RESPONSE
  response.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

export const updateMe = catchAsync(async (request, response, next) => {
  // 1) Error if user posts a password
  if (request.body.password || request.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates, please use  /updateMyPassword',
        400
      )
    );
  }
  // 2) Filtered out unwanted fields
  const filteredBody = filterObject(request.body, 'name', 'email'); //grab only two fields to prevent posting stuff like "role: admin", etc..
  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(
    request.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  response.status(200).json({
    status: 'sucess',
    data: {
      user: updatedUser,
    },
  });
});
export function getUser(request, response) {
  response.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
}
export function createUser(request, response) {
  response.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
}
export function updateUser(request, response) {
  response.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
}
export function deleteUser(request, response) {
  response.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
}
