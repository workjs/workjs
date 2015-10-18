
module.exports.get = function get(next) {
  this.clear_session();
  next();
};

module.exports.post = function post(next) {
  this.session.data = JSON.stringify({user: this.login[0], lang: "de"});
  if (this.session.id === this.id) { //do not persist sessions created with this request
    this.reply303("/login");
  } else {
    this.set_session();
    this.reply303("/ds/session");
  };
};
