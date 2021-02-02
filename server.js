/* eslint-disable no-console */
const dotenv = require('dotenv');
const mongoose = require('mongoose');

//Exception handling should be at the top
process.on('uncaughtException', (error) => {
  console.log('Unhandled exception, shutting down..');
  console.log(error.name, error.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
// Listening to unhandled rejection event => allows to handle all the errors that occur in asynchronous code which were not previously handled.
process.on('unhandledRejection', (error) => {
  console.log('Unhandled rejection. Shutting down..', error.message);
  //Shutdown gracefully: first close the server, then shut down the app
  server.close(() => {
    process.exit(1);
  });
});
