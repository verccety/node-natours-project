import multer from 'multer';
import sharp from 'sharp';
import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

import * as factory from './handlerFactory.js';

// const multerStorage = multer.diskStorage({
//   destination: (request, response, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (request, file, cb) => {
//     const ext = file.mimetype.split('/')[1];

//     cb(null, `user-${request.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (request, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError('Not an image, please upload only images', 404), false);
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const filterObject = (object, ...allowedFields) => {
  const newObject = {};
  Object.keys(object).forEach((element) => {
    if (allowedFields.includes(element)) newObject[element] = object[element];
  });

  return newObject;
};

export const getMe = (request, response, next) => {
  request.params.id = request.user.id;
  next();
};

export const uploadUserPhoto = upload.single('photo');

export const resizeUserPhoto = catchAsync(async (request, response, next) => {
  if (!request.file) return next();

  request.file.filename = `user-${request.user.id}-${Date.now()}.jpeg`;

  await sharp(request.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${request.file.filename}`);

  next();
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
  if (request.file) filteredBody.photo = request.file.filename;
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
    status: 'success',
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
