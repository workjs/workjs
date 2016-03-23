
module.exports.get = function get_map(next) {
  this.context.r = this.conf;
  next();
};

