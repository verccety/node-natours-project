import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// eslint-disable-next-line import/prefer-default-export
export const signup = catchAsync(async (request, response, next) => {
  const newUser = await User.create({
    name: request.body.name,
    email: request.body.email,
    password: request.body.password,
    passwordConfirm: request.body.passwordConfirm,
  });

  const token = signToken(newUser._id);
  response.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

export const login = catchAsync(async (request, response, next) => {
  const { email, password } = request.body;

  //1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  //2) Check if correct
  const user = await User.findOne({
    email,
  }).select('+password'); // when field by default not selected - use plus+

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password'), 401); // Specify 'or' to be vague for security reasons
  }
  //3) If ok -> send token
  const token = signToken(user._id);

  response.status(200).json({
    status: 'success',
    token,
  });
});
