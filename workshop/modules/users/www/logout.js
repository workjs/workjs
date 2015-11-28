
module.exports.get = function logout(next) {
  this.auth.logout();
  this.reply303("/");
};
