
module.exports.get = function get(next) {
  this.clear_session();
  next();
};
