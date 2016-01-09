require('./repo.js');
var w = module.work;

/*
drop table users cascade ;
*/

w.db.query("create table IF NOT EXISTS work_users (" +
  "user_id serial PRIMARY KEY" +
  ",email text UNIQUE" +
  ",nick text" +
  ",hash text" +
  ",login timestamptz" +
  ",login2 timestamptz" +
  ",creation timestamptz DEFAULT now()" +
  ",rootfolder int REFERENCES work_repo (item_id) ON DELETE SET NULL);" );

w.auth = {};
w.auth.conf_cache = {};

function Auth(wrk) {
  this.wrk = wrk;
  this.user = null;
  this.username = null;
  if (wrk.session && wrk.session.data && wrk.session.data.user_id) {
    var u = w.db.one("SELECT * FROM work_users WHERE user_id=:user_id", {user_id:wrk.session.data.user_id});
    if (u) {this.user = new User(u); this.username = this.user.username(); }
  };
};

Auth.prototype.login = function login(user) {
  this.wrk.session.set("user_id", user.user_id);
  this.user = user;
  w.db.query("UPDATE work_users SET login2=login, login=now() WHERE user_id=:user_id", {user_id:user.user_id});
};

Auth.prototype.logout = function logout() {
  this.wrk.session.clear();
  this.user = null;
};

w.auth.logout = function logout(user_id) {
  w.session.clear('{user,id}', user_id);
};

//create hash from string (e.g. password)
w.auth.hash = function hash(pw) {
  return w.dependencies.bcrypt.hashSync(pw, w.conf.auth_salt);
};

//check if a hash matches a string (password)
w.auth.check = function check(pw, hash) {
  return w.dependencies.bcrypt.compareSync(pw, hash);
};

//auth middleware - get current user from session and fetch user data from DB
w.auth.mw = function auth_mw(next) {
  this.auth = new Auth(this);
  next();
};

//prototype for user objects
function User(u) {
  this.user_id = u.user_id;
  this.email = u.email;
  this.nick = u.nick;
  this.rootfolder = u.rootfolder;

  this.username = function() {
    return(this.nick);
  };

};

//get rootfolder of current user or create new one 
Auth.prototype.get_user_rootfolder_id = function get_user_rootfolder_id() {
  if (this.user) {
    if (this.user.rootfolder) { return this.user.rootfolder }
    else {
      this.user.rootfolder = this.wrk.cr_add_folder(this.user.nick);
      this.wrk.db.query("UPDATE work_users set rootfolder=:rootfolder WHERE user_id=:user_id",
        {user_id:this.user.user_id, rootfolder:this.user.rootfolder});
      return this.user.rootfolder
    };
  } else return null;
};

w.auth.get_user_rootfolder_id = function get_user_rootfolder_id(user_id) {
  var u = w.db.one("SELECT * FROM work_users WHERE user_id=:user_id", {user_id:user_id});
  if (u) {
    if (u.rootfolder) { return u.rootfolder }
    else {
      u.rootfolder = w.cr.add_folder(u.nick);
      this.db.query("UPDATE work_users set rootfolder=:rootfolder WHERE user_id=:user_id",
        {user_id:user_id, rootfolder:u.rootfolder});
      return u.rootfolder
    };
  } else return null;
};
