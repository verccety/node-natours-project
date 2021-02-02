import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plese specify your name'],
    trim: true,
    maxlength: [40, 'A user name must have less or equal than 40 characters'],
    minlength: [2, 'A user name must have more or equal than 10 characters'],
    validate: [
      (value) => validator.isAlpha(value, 'en-US', { ignore: ' -' }),
      'User name must only contain characters',
    ],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    lowercase: true,
    unique: true,
    validate: [validator.isEmail, 'Please fill a valid email address'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    min: [8, 'A password must be minimum 6 characters length'],
    max: [20, 'A password must be maximum 20 characters length'],
  },
  passwordConfirm: {
    type: String,
    required: true,
    min: [8, 'A password must be minimum 6 characters length'],
    max: [20, 'A password must be maximum 20 characters length'],
  },
});

const User = mongoose.model('User', userSchema);

export default User;
