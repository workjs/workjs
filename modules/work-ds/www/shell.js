var util = require('util');

module.exports.post = function post(next) {
  this.context = this.parseFormSync();
  this.context.oo = util.inspect(this.context);
  console.log("RRTTTTTTCCC", this.context, this.tx);
  try {
  var r = function(str){
    console.log("SHELL FKT ", str);
    return(eval(str));
  }.call(this,this.context.code[0]);
    this.context.r = util.inspect(r);
  } catch (e) { this.context.r = e };
  next();
};


module.exports.get = function get(next) {
  this.context.oo = util.inspect(this.context);
  next();
};

