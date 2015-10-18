var util = require('util');

var w = module.work;

module.exports.get = function get_map(next) {
  this.log("huhu");
  this.context.r = util.inspect(w, {depth:10});
  next();
};
