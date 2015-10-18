var util = require('util');

var w = module.work;
var Cookies = w.dependencies.cookies;

module.exports.get = function cookies(next) {
  var c = new Cookies( this.req, this.res, w.conf.session_secrets );
  var sess = c.get( "work:sess", { signed: true } );
  this.context.r = util.inspect({"work:sess": sess, ID: this.id});
  
  c.set( "work:sess", this.id, { signed: true } )
  next();
};

module.exports.post = function cookies(next) {
  var c = new Cookies( this.req, this.res, w.conf.session_secrets );
  c.set("work:sess")
  this.reply303(this.req.url);
};
