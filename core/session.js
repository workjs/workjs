w.module("session", `WorkJS provides a cookie based session support (server side). 
It uses signed cookies.`);

w.db.query("create table IF NOT EXISTS work_session " +
           "(id bigint PRIMARY KEY, last bigint, data json);" );

w.session.cache = {};
w.session.update = (w.conf.session_update || 60) * 1000;
w.session.fresh = (w.conf.session_fresh || 20) * 1000;

w.session.decline = (w.conf.session_decline || 2 * 24 * 60 * 60) * 1000;
w.session.sweep = (w.conf.session_sweep || 120 ) * 1000;

w.session.sweeper = setInterval(function sweep_sessions() {
  console.log("............. sweep_sessions ................");
  var now = Date.now();
  var drop = now - w.session.decline;
  w.dep.syncho(function sweep() {
    w.db.query("delete from work_session where last<:drop", {drop:drop});
    for (var id in w.session.cache) {
      if (w.session.cache[id].data && w.session.cache[id].last < drop) {
         delete w.session.cache[id]; }
    };
  });
}, w.session.sweep);

//session middleware - fetch session from cookie and cache and DB
//create new session if none present
w.session.mw = function session_mw(next) {
  this.session = new w.session.proto(this);
  next();
  this.session.finish();
};

w.session.proto = function Session(wrk) {
  //we use wrk.id === this.now
  this.wrk = wrk;
  this.id = parseInt(wrk.cookies.get_signed(w.conf.session_cookie), 10);
  this.new_data = false;
  
  if (this.id) { 

    if (w.session.cache[this.id]) { //data found in session.cache
      this.data = w.session.cache[this.id].data;
      this.last = w.session.cache[this.id].last;
    } else { //data missing in cache -> fetch from DB
      var cached = w.db.one("select * " +
                "from work_session WHERE id=:id", {id:this.id});
      if (cached) { //data found in DB
        w.session.cache[this.id] = cached;
        this.data = w.session.cache[this.id].data;
        this.last = w.session.cache[this.id].last;
        this.fresh = false;
      } else {
        //remember absence
        w.session.cache[this.id] = { data:null, last:0, fresh:false };
        //prepare new
        this.id = 0; this.data = {}; this.last = 0; }
    }

  } else { this.id = 0; this.data = {}; this.last = 0;  }
};

w.session.proto.prototype.finish = function session_finish() {
  if (this.id) {
  
    if (w.session.cache[this.id].fresh) {
    
      if (this.new_data) { w.session.cache[this.id].data = this.data };
      
      if (this.wrk.id > w.session.cache[this.id].fresh) {
        w.db.query("INSERT INTO work_session (id, last, data) VALUES (:id, :now, :data);",
                  {id:this.id, now:this.wrk.id, data:JSON.stringify(this.data)});
        w.session.cache[this.id].last = this.wrk.id;
        w.session.cache[this.id].fresh = 0;
      };
    
    } else {
    
      if (this.new_data) {
      
        w.session.cache[this.id].data = this.data;
        w.db.query("UPDATE work_session SET last=:now, data=:data WHERE id=:id;",  
                  {id:this.id, now:this.wrk.id, data:JSON.stringify(this.data)});
        w.session.cache[this.id].last = this.wrk.id;
      
      } else {
      
        if (this.wrk.id > this.last+w.session.update) {
          w.db.query("UPDATE work_session SET last=:now WHERE id=:id;",
                    {id:this.id, now:this.wrk.id});
          w.session.cache[this.id].last = this.wrk.id;
        };
      
      }
      
    }
    
  } else { //new session
  
    if (this.new_data) {
      w.session.cache[this.wrk.id] = {data:this.data, last:0, fresh:this.wrk.id+w.session.fresh};
      this.wrk.cookies.set(w.conf.session_cookie, this.wrk.id.toString(), {sign:true});
    };
    
  };
}.doc(`Finish session, prepare session cache to contain new session data, prepare session cookie.`);

w.session.proto.prototype.set = function session_set(key, val) {
  this.data[key] = val;
  this.new_data = true;
};

w.session.proto.prototype.get = function session_get(key) {
  return this.data[key];
};

w.session.proto.prototype.clear = function session_clear() {
  this.wrk.cookies.clear(w.conf.session_cookie, {sign:true});
  w.session.cache[this.id] = { data:null, last:0, fresh:false };
  this.id = null;
};
