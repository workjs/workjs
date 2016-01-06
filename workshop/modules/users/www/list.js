var w = module.work;

module.exports.get = function list_users(next) {
  this.context.users = this.db.rows("select * from work_users");
  console.log(this.context.users);
  next();
};
