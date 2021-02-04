import jwt from 'jsonwebtoken';
import { promisify } from 'util';
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
    role: request.body.role,
    password: request.body.password,
    passwordConfirm: request.body.passwordConfirm,
    passwordChangedAt: request.body.passwordChangedAt,
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

export const protect = catchAsync(async (request, response, next) => {
  // 1) Get the token
  let token;
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith('Bearer')
  ) {
    token = request.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in, please log in to get access!'),
      401
    );
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The user belonging to the token does not exist', 401)
    );
  }
  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password!', 401));
  }

  // Grant access to protected route

  request.user = currentUser; // pass object to second middleware
  next();
});

export const restrictTo = (...roles) => (request, response, next) => {
  if (!roles.includes(request.user.role)) {
    return next(
      new AppError('You do not have permission to perform this action', 403)
    );
  }

  next();
};
