
module.exports.get = function get_map(next) {
  const x = {};
  Object.keys(w).sort().forEach(function(key) {
    x[key] = w[key];
  });
  this.context.x = w.util.inspect(x);
  next();
};
