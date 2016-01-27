var util = require('util');

module.exports.post = function post(next) {
  console.log(this.session);

  if (this.session.id === this.id) { //do not persist sessions created with this request
    this.reply3xx(303, "/login");
  } else {
    var user = this.db.one("select * from work_users where email=:email",
      {email: this.context.email});
    if (user && this.work.auth.check(this.context.pw, user.hash)) {
      this.auth.login(user);
      this.reply3xx(303, "/");
    } else this.reply3xx(303, "/login");
  }

};
