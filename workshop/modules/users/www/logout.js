
module.exports.get = function logout(next) {
  this.auth.logout();
  this.reply3xx(303, "/");
};
