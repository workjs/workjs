
module.exports.post = function post(next) {
  this.context.x = w.util.inspect(this.context);
  try {
  var r = function(str){
    return(eval(str));
  }.call(this,this.context.code);
    this.context.r = w.dep.util.inspect(r);
  } catch (e) { this.context.r = e + "\n\n" + e.stack};
  next();
};


module.exports.get = function get(next) {
  next();
};

