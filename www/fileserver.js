
module.exports.get = function(next) {
  this.sendFileSync(this.work.coredir+'/static', this.context._location);
  //no need for next() or this.end() as we are last and sendFileSync sends the reply
};
