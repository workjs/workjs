
module.exports.get  = function chat_home(next) {
  this.reply3xx(303, this.url.pathname+"/setup");
};
