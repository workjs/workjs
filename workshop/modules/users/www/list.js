var w = module.work;

module.exports.get = function list_users(next) {
  this.context.users = this.tx.rows("select * from users");
  console.log(this.context.users);
  next();
};
