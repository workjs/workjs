var util = require('util');
var dateformat=require("dateformat");

var w = module.work;

module.exports.get = function get(next) {
  var tab = [];
  var now = Date.now();

  this.context.session = w.session;
  
  this.context.lastSweep = dateformat(w.session.drop, "yyyy-mm-dd/HH:MM:ss");
  this.context.nextSweep = Math.floor((w.session.sweep - now + w.session.drop)/1000);
  
  this.context.sessions = util.inspect(w.sessions);
  
  var sess_db = this.tx.rows("select id, data, last FROM work_session order by id desc");
  this.context.db_sessions = util.inspect(sess_db);
  
  for (var i=0; i<sess_db.length; ++i) {
    var id = sess_db[i].id;
    var start = new Date(parseInt(sess_db[i].id));
    var last = new Date(parseInt(sess_db[i].last));
    tab[i] = {
      cache:w.sessions[id] ? "+" : "",
      id:id,
      start:dateformat(start, "yyyy-mm-dd/HH:MM:ss"),
      last:dateformat(last, "yyyy-mm-dd/HH:MM:ss"),
      data:util.inspect(sess_db[i].data),
      decline: w.session.decline - now + parseInt(sess_db[i].last)
    }
  };
  
  this.context.tab = tab;

  next();
};
