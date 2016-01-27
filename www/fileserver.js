
module.exports.get = function(next) {
  this.sendFileSync(this.conf.staticdir, this.context._location);
  //no need for next() or this.end() as we are last and sendFileSync sends the reply
};
