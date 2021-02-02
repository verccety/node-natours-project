export default (function_) => (request, response, next) => {
  function_(request, response, next).catch(next);
};
