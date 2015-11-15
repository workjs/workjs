var Sync = require('syncho');

var w = module.work;

//local session cache
w.sessions = {};
w.session_counter = 0;

w.session = {};
w.session.update = (w.conf.session_update || 60) * 1000;
w.session.decline = (w.conf.session_decline || 2 * 24 * 60 * 60) * 1000;
w.session.sweep = (w.conf.session_sweep || 120 ) * 1000;
w.session.drop = Date.now(); //last sweeper run

w.db.query("create table IF NOT EXISTS work_session " +
                       "(id bigint PRIMARY KEY, last bigint, data json);" );
  
function Session(wrk) {
  this.wrk = wrk;
  this.now = wrk.id;
  this.session_cookie = new w.dependencies.cookies(wrk.req, wrk.res, w.conf.session_secrets);
  this.id = this.session_cookie.get( "work:sess", { signed: true } );
  if (this.id) { //request contains a valid session_cookie
    if (this.id > 0) { //session with data
      if (w.sessions[this.id]) { //session in session cache
        this.data = w.sessions[this.id].data;
        if (w.sessions[this.id].last && (this.now - w.sessions[this.id].last > w.session.update)) {
          this.last = this.now;
          w.db.query("update work_session set last=:now WHERE id=:sessid",
            {sessid:this.id, now:this.last});
        } else this.last = w.sessions[this.id].last;
      } else { //no data in session cache
        this.data = w.db.one("update work_session set last=:now WHERE id=:sessid returning data",
          {now:this.now, sessid:this.id});
        if (this.data) { //got data from DB -> cache it
          this.last = this.now;
          w.sessions[this.id] = {id:this.id, last:this.last, data:this.data};
        } else { //no data in DB ?? -> remember absence in cache, clear and recreate
          w.sessions[this.id] = {id:this.id, last:0, data:[]};
          this.create();
        };
      };
    } else { //session without data
      this.last = 0;
      this.data = {};
    };
  } else { //no valid session_cookie, create new session
    this.create();
  };
};

Session.prototype.create = function create() {
  console.log("NEW session!!");
  if (this.now <= w.session_counter) {this.now = ++w.session_counter;}
  else w.session_counter = this.now;
  //mark negative for new uncached session
  this.session_cookie.set("work:sess", -this.now, {signed: true, overwrite: true});
  //no id in created session
  this.id = null;
  this.last = 0;
};

//clear data from cache
Session.prototype.clear = function clear() {
  delete w.sessions[this.id];
  this.create();
};

//persist data in session
Session.prototype.set = function set(key, value) {
  if (this.id) {
    this.data[key] = value;
    this.last = this.now;
    if (this.id < 0) { //new persist
      this.id = -this.id;
      this.session_cookie.set("work:sess", this.id, {signed: true, overwrite: true});
      w.db.query("INSERT into work_session (id, last, data) VALUES (:id, :now, :data)",
        {id:this.id, now:this.now, data:JSON.stringify(this.data)});
    } else { //update session data
      w.db.query("UPDATE work_session SET last=:now, data=:data WHERE id=:sessid", 
        {now:this.now, data:JSON.stringify(this.data), sessid:this.id});
    };
    w.sessions[this.id] = {id:this.id, last:this.now, data:this.data};
  } else {
    this.wrk.reply500("no session available to set data");
  };
};

//session middleware - fetch session from cookie and cache and DB
//create new session if none present
var mw = function session_mw(next) {
  this.session = new Session(this);
  next();
};

w.session.mw = mw;

w.session.sweeper = setInterval(function sweep_sessions() {
    console.log("............. sweep_sessions ................");
    var now = Date.now();
    var drop = now - w.session.decline;
    Sync(function sweep() {
      w.db.query("delete from work_session where last<:drop", {drop:drop});
      for (var id in w.sessions) {
        if (w.sessions[id].last < drop) { delete w.sessions[id]; }
      };
    });
    w.session.drop = now;
}, w.session.sweep);
