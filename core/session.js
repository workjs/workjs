var Sync = require('syncho');

var w = module.work;

//local session cache
w.sessions = {};

w.session = {};
w.session.fresh = (w.conf.session_fresh || 30) * 1000;
w.session.update = (w.conf.session_update || 60) * 1000;
w.session.decline = (w.conf.session_decline || 2 * 24 * 60 * 60) * 1000;
w.session.sweep = (w.conf.session_sweep || 120 ) * 1000;
w.session.drop = Date.now(); //last sweeper run

w.db.query("create table IF NOT EXISTS work_session " +
                       "(id bigint PRIMARY KEY, last bigint, data json);" );
  
//persist session
function set() {
  if ( this.session && this.session.data ) {
    this.tx.query("INSERT into work_session (id, last, data) VALUES (:id, :last, :data)",
      {id:this.session.id, last:this.session.last, data:this.session.data});
    console.log("persist session  * * * insert ENDE");
    w.sessions[this.session.id] = {id:this.session.id, last:this.session.last, data:this.session.data};
  };
};

function clear() {
  delete w.sessions[this.session_id];
  this.new_session();
};

var session_counter = 0;

function new_session() {
  var sessID = this.id;
  while (sessID <= session_counter) sessID++;
  session_counter = sessID;
  this.session_cookie.set("work:sess", sessID, { signed: true, overwrite: true } );
  this.session = {"id": sessID, "last": 0, "data": null}
};

//also for middleware
//get session from cookie, set new if none or invalid
var get_session = function get_session(next) {
//      console.log("* * * get_session");
//      console.log(new Error().stack);
      // we use: now === this.id
      var Cookies = w.dependencies.cookies;
      this.session_cookie = new Cookies( this.req, this.res, w.conf.session_secrets );
      var sessID = this.session_cookie.get( "work:sess", { signed: true } );
      console.log("sessID ==== ", sessID);
      if (sessID) { //request contains a valid session_cookie
        console.log("we have a sessID: ", sessID);
        this.session_id = sessID;
        var sessionData = w.sessions[sessID];
        if (sessionData) { //session in session cache
          this.session = sessionData;
          console.log("session in session cache ****");
          if (this.id - sessionData.last > w.session.update) { //update acctime in DB; use own DB TX
             console.log("session Update DB - this.id - sessionData.last > w.session.update: ",
               this.id, sessionData.last, w.session.update);
            w.db.query("update work_session set last=:now WHERE id=:id", {id:sessID, now:this.id});
            w.sessions[sessID].last = this.id;
          } else {
            console.log("session no DB Update: ", sessID);
          };
        } else if (sessionData === undefined) { //no data in session cache
          console.log("session no data in session cache ***");
          if (this.id - sessID > w.session.fresh) { //not fresh -> check in DB
            sessionData = w.db.one("select data, last FROM work_session WHERE id=:id", {id:sessID});
            console.log("session Data from DB: ", sessionData);
            if (sessionData) { //got data from DB -> cache it
              this.session = sessionData;
              w.sessions[sessID] = sessionData;
              if (this.id - sessionData.last > w.session.update) { //update acctime in DB
                w.db.query("update work_session set last=:now WHERE id=:id", {id:sessID, now:this.id});
                w.sessions[sessID].last = this.id;
              };
            } else { //not in DB -> renew
              w.sessions[sessID] = null; this.new_session();
            };
          } else { //fresh and uncached session - i.e. no data
            this.session = {"id": sessID, "last": this.id, "data": null};
          }
        } else { this.new_session(); };
      } else { this.new_session(); };
      next();
};

w.session.new_session = new_session;
w.session.get_session = get_session;
w.session.set = set;
w.session.clear = clear;

  w.session.sweeper = setInterval(function sweep_sessions() {
    console.log("............. sweep_sessions ................");
    var now = Date.now();
    var drop = now - w.session.decline;
    Sync(function sweep() {
      w.db.query("delete from work_session where last<:drop", {drop:drop});
      for (var id in w.sessions) {
        if (!w.sessions[id] || w.sessions[id].last < drop) { delete w.sessions[id]; }
      };
    });
    w.session.drop = now;
  }, w.session.sweep);

