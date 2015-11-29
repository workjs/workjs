
var w = module.work;
w.caches.user_confirmation = {};

/*
drop table users cascade ;
drop table groups cascade ;
*/

w.db.query("create table IF NOT EXISTS users (" +
  "user_id serial PRIMARY KEY, " +
  "email text UNIQUE, " +
  "nick text, " +
  "hash text, " +
  "login timestamptz, " +
  "login2 timestamptz, " +
  "creation timestamptz DEFAULT now());" );

w.db.query("create table IF NOT EXISTS users_confirmation (" +
  "randomurl text PRIMARY KEY, " +
  "email text NOT NULL, " +
  "nick text, " +
  "hash text, " +
  "creation timestamptz DEFAULT now());" +
  "CREATE INDEX IF NOT EXISTS users_confirmation_email_idx ON users_confirmation (email);" );

w.db.query("create table IF NOT EXISTS groups (" +
  "id serial PRIMARY KEY, " +
  "name text, " +
  "parent int REFERENCES groups ON DELETE CASCADE, " +
  "creation timestamptz DEFAULT now());" );

w.auth = {};

function Auth(wrk) {
  this.wrk = wrk;
  if (wrk.session && wrk.session.data && wrk.session.data.user_id) {
    var u = w.db.one("SELECT * FROM users WHERE user_id=:user_id", {user_id:wrk.session.data.user_id});
    this.user = new User(u);
  } else this.user = null;
};

Auth.prototype.login = function login(user) {
  this.wrk.session.set("user_id", user.user_id);
  this.user = user;
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

Auth.prototype.hash = function hash(pw) {
  return w.dependencies.bcrypt.hashSync(pw, w.conf.auth_salt);
};

//check if a hash matches a string (password)
w.auth.check = function check(pw, hash) {
  return w.dependencies.bcrypt.compareSync(pw, hash);
};

Auth.prototype.check = function check(pw, hash) {
  return w.dependencies.bcrypt.compareSync(pw, hash);
};

//auth middleware - get current user from session and fetch user data from DB
w.auth.mw = function auth_mw(next) {
  this.auth = new Auth(this);
  next();
};

//user middleware - get current user from session and fetch user data from DB
//requires auth.mw
w.auth.usermw = function usermw(next) {
  this.context.username = this.auth && this.auth.user && this.auth.user.username();
  next();
};

//prototype for user objects
function User(u) {
  this.user_id = u.user_id;
  this.email = u.email;
  this.nick = u.nick;

  this.username = function() {
    return(this.nick);
  };

};
