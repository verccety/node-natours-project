import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';

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
