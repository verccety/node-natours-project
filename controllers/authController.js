import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { promisify } from 'util';
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import sendEmail from '../utils/email.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, response) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  response.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  response.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

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

  createSendToken(newUser, 201, response);
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
  createSendToken(user, 200, response);
});

export const protect = catchAsync(async (request, response, next) => {
  // 1) Get the token
  let token;
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith('Bearer')
  ) {
    token = request.headers.authorization.split(' ')[1];
  } else if (request.cookies.jwt) {
    token = request.cookies.jwt;
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

export const isLoggedIn = catchAsync(async (request, response, next) => {
  if (request.cookies.jwt) {
    const decoded = await promisify(jwt.verify)(
      request.cookies.jwt,
      process.env.JWT_SECRET
    );

    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next();
    }
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next();
    }

    // PUG templates will have access to response.locals
    response.locals.user = currentUser;
    return next();
  }
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

export const forgotPassword = catchAsync(async (request, response, next) => {
  // 1) Get user based on email
  const user = await User.findOne({ email: request.body.email });
  if (!user)
    return next(new AppError('There is no user with that email.', 404));
  // 2) Generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // only modified, needs to be saved
  // 3) Send it to user email

  const resetURL = `${request.protocol}: //${request.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n If you didn't request reset, please ignore this message!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    response.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('There was an error sending the email.', 500));
  }
});

export const resetPassword = catchAsync(async (request, response, next) => {
  // 1) Find user by token
  const hashedToken = crypto
    .createHash('sha256')
    .update(request.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired + user exists  => set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = request.body.password;
  user.passwordConfirm = request.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // For everything related to password - run SAVE instead FindOne, etc.., =>
  // need to run all validators
  await user.save();
  // 3) Update changedPasswordAt

  // 4) Log the user in
  createSendToken(user, 200, response);
});

export const updatePassword = catchAsync(async (request, response, next) => {
  // 1) Get user from DB
  const user = await User.findById(request.user.id).select('+password');

  // 2) Check if password is valid
  if (
    !(await user.correctPassword(request.body.passwordCurrent, user.password))
  ) {
    return next(new AppError('Incorrect password or user not found', 400));
  }

  // 3) If yes, update it
  user.password = request.body.password;
  user.passwordConfirm = request.body.passwordConfirm;
  await user.save();

  // 4) Log in user, send JWT

  createSendToken(user, 200, response);
});
