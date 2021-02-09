import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import * as factory from './handlerFactory.js';

const filterObject = (object, ...allowedFields) => {
  const newObject = {};
  Object.keys(object).forEach((element) => {
    if (allowedFields.includes(element)) newObject[element] = object[element];
  });

  return newObject;
};

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

export const deleteMe = catchAsync(async (request, response, next) => {
  await User.findByIdAndUpdate(request.user.id, { active: false });

  response.status(204).json({
    status: 'success',
    data: undefined,
  });
});
export function createUser(request, response) {
  response.status(500).json({
    status: 'error',
    message: 'This route is not defined, please use /signUp instead',
  });
}

export const getAllUsers = factory.getAll(User);
export const getUser = factory.getOne(User);
// Warning: passwords should not be updated with this
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);
