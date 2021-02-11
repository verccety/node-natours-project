import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import APIFeatures from '../utils/apiFeatures.js';

const getCollectionName = (Model) => {
  let {
    collection: { collectionName },
  } = Model;

  // Convert to singular
  collectionName = collectionName.slice(0, -1);
  return collectionName;
};

// eslint-disable-next-line import/prefer-default-export
export const deleteOne = (Model) =>
  catchAsync(async (request, response, next) => {
    const document = await Model.findByIdAndDelete(request.params.id);

    const collectionName = getCollectionName(Model);

    if (!document) {
      return next(new AppError(`No ${collectionName} found with that ID`, 404));
    }
    response.status(204).json({
      status: 'success',
      data: undefined,
    });
  });

export const updateOne = (Model) =>
  catchAsync(async (request, response, next) => {
    const document = await Model.findByIdAndUpdate(
      request.params.id,
      request.body,
      {
        new: true,
        runValidators: true,
      }
    );

    const collectionName = getCollectionName(Model);

    if (!document) {
      return next(new AppError(`No ${collectionName} found with that ID`, 404));
    }

    response.status(200).json({
      status: 'success',
      data: {
        [collectionName]: document,
      },
    });
  });

export const createOne = (Model) =>
  catchAsync(async (request, response, next) => {
    const document = await Model.create(request.body);
    const collectionName = getCollectionName(Model);

    response.status(201).json({
      status: 'success',
      data: {
        [collectionName]: document,
      },
    });
  });

export const getOne = (Model, popOptions) =>
  catchAsync(async (request, response, next) => {
    let query = Model.findById(request.params.id);
    if (popOptions) query = query.populate(popOptions);
    const document = await query;
    const collectionName = getCollectionName(Model);

    if (!document) {
      return next(new AppError('No document found with that id', 404));
    }

    response.status(200).json({
      status: 'success',
      data: {
        [collectionName]: document,
      },
    });
  });

export const getAll = (Model) =>
  catchAsync(async (request, response, next) => {
    //const query = await Model.find ().where('duration').equals(5) - один из способов фильтрации
    // EXECURE QUERY
    const features = new APIFeatures(Model.find(), request.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const document = await features.query;
    // const document = wait features.query.explain();
    const collectionName = getCollectionName(Model);

    // SEND RESPONSE
    response.status(200).json({
      status: 'success',
      results: document.length,
      data: {
        [collectionName]: document,
      },
    });
  });
