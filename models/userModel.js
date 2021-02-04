import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

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
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: true,
    min: [8, 'A password must be minimum 6 characters length'],
    max: [20, 'A password must be maximum 20 characters length'],
    validate: {
      // Will run only on CREATE or SAVE!
      validator: function (element) {
        return element === this.password;
      },
      message: 'Passwords do not match!',
    },
    passwordChangedAt: Date,
  },
});

userSchema.pre('save', async function (next) {
  // Run if pass was modified
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

//Instance method - available on all documents
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  // Since pass is select:false we need to pass password explicitly

  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Number.parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // true - if password was changed later than issued token
    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

const User = mongoose.model('User', userSchema);

export default User;
