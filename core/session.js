var w = module.work;

w.session = {};
w.session.cache = {};
w.session.counter = 0;
w.session.update = (w.conf.session_update || 60) * 1000;
w.session.decline = (w.conf.session_decline || 2 * 24 * 60 * 60) * 1000;
w.session.sweep = (w.conf.session_sweep || 120 ) * 1000;
w.session.drop = Date.now(); //last sweeper run

w.db.query("create table IF NOT EXISTS work_session " +
                       "(id bigint PRIMARY KEY, last bigint, data json);" );
  
function Session(wrk) {
  this.wrk = wrk;
  this.now = wrk.id;
  this.session_cookie = new w.dep.cookies(wrk.req, wrk.res, w.conf.session_secrets);
  this.id = this.session_cookie.get( w.conf.cookiename, { signed: true } );
  if (this.id) { //request contains a valid session_cookie
    if (this.id > 0) { //session with data
      if (w.session.cache[this.id]) { //session in session cache
        this.data = w.session.cache[this.id].data;
        if (w.session.cache[this.id].last && (this.now - w.session.cache[this.id].last > w.session.update)) {
          this.last = this.now;
          w.db.query("update work_session set last=:now WHERE id=:sessid",
            {sessid:this.id, now:this.last});
        } else this.last = w.session.cache[this.id].last;
      } else { //no data in session cache
        var data = w.db.one("update work_session set last=:now WHERE id=:sessid returning data",
          {now:this.now, sessid:this.id});
        if (data) { //got data from DB -> cache it
          this.last = this.now;
          this.data = data.data;
          w.session.cache[this.id] = {id:this.id, last:this.last, data:this.data};
        } else { //no data in DB ?? -> remember absence in cache, clear and recreate
          w.session.cache[this.id] = {id:this.id, last:0, data:[]};
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
  if (this.now <= w.session.counter) {this.now = ++w.session.counter;}
  else w.session.counter = this.now;
  //mark negative for new uncached session
  this.session_cookie.set("work:sess", -this.now, {signed: true, overwrite: true});
  //no id in created session
  this.id = null;
  this.last = 0;
};

//clear data from cache
Session.prototype.clear = function clear() {
  delete w.session.cache[this.id];
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
    w.session.cache[this.id] = {id:this.id, last:this.now, data:this.data};
  } else {
    this.wrk.reply5xx(500, "no session available to set data");
  };
};

//clear session by data value
w.session.clear = function clear(path, value) {
  var id = w.db.one("DELETE FROM work_session WHERE data#>>:path=:value returning id",
    {path:path, value:value});
  //clear from session cache
  w.session.cache[id.id] = {id:id.id, last:0, data:[]};
};

w.session.sweeper = setInterval(function sweep_sessions() {
    console.log("............. sweep_sessions ................");
    var now = Date.now();
    var drop = now - w.session.decline;
    w.dep.syncho(function sweep() {
      w.db.query("delete from work_session where last<:drop", {drop:drop});
      for (var id in w.session.cache) {
        if (w.session.cache[id].last < drop) { delete w.session.cache[id]; }
      };
    });
    w.session.drop = now;
}, w.session.sweep);

//session middleware - fetch session from cookie and cache and DB
//create new session if none present
w.session.mw = function session_mw(next) {
  this.session = new Session(this);
  next();
};
