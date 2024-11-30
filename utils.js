function asyncWrapper(handlerFunction) {
  return async function (req, res, next) {
    try {
      await handlerFunction(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { asyncWrapper };
