var w = module.work;

module.exports.get = function get_map(next) {
  this.context.x = w.util.inspect(w);
  next();
};
