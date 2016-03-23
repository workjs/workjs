
var alogdir = w.conf.log_access + '/';
w.dep.mkdirp.sync(alogdir, null);

var dlogdir = w.conf.log_debug + '/';
w.dep.mkdirp.sync(dlogdir, null);

var mlogdir = w.conf.log_message + '/';
w.dep.mkdirp.sync(mlogdir, null);

var logday;

var alogfs, dlogfs, mlogfs;

function _creatLogStreams() {
  logday = w.dep.dateformat(Date.now(), "yyyy-mm-dd");
  
  mlogfs = w.dep.fs.createWriteStream(mlogdir+logday+'.log', {flags:'a'});
  mlogfs.on('error', function(e){ console.log('error: ', e); });
  
  if (alogdir === mlogdir) { alogfs = mlogfs; }
  else {
    alogfs = w.dep.fs.createWriteStream(alogdir+logday+'.log', {flags:'a'});
    alogfs.on('error', function(e){ console.log('error: ', e); });
  };

  if (dlogdir === mlogdir) { dlogfs = mlogfs; }
  else {
    if (dlogdir === alogdir) { dlogfs = alogfs; }
    else {
      dlogfs = w.dep.fs.createWriteStream(dlogdir+logday+'.log', {flags:'a'});
      dlogfs.on('error', function(e){ console.log('error: ', e); });
    };
  };
};

function _closeLogStreams() {
    mlogfs.end();
    if (alogdir !== mlogdir) alogfs.end();
    if (dlogdir !== mlogdir && dlogdir !==alogdir) dlogfs.end();
};

_creatLogStreams();
  
w.proto.log = function log() {
    var now = Date.now(); 
    var datestring = w.dep.dateformat(now, "yyyy-mm-dd/HH:MM:ss");
    if (datestring.substring(0, 10) !== logday) {
      _closeLogStreams();
      _creatLogStreams();
    };
    
    for (var i=0; i<arguments.length; i++) {
      if (typeof(arguments[i]) === 'string') {
        mlogfs.write(datestring + " " + this.id + " ### " + arguments[i] + "\n");
      } else {
        mlogfs.write(datestring + " " + this.id + " ### " + w.dep.util.inspect(arguments[i], {depth:6})+"\n");
      };
    };
};

w.proto.debug = w.proto.log;

w.mw.alogger = function alogger(next) {
    var start = Date.now();
    next();
    var end = Date.now();
    var duration = end - start;
    var now = w.dep.dateformat(end, "yyyy-mm-dd/HH:MM:ss");
    if (now.substring(0, 10) !== logday) {
      _closeLogStreams();
      _creatLogStreams();
    };
    
    alogfs.write(now + " "
    + this.id + " "
    + this.req.remoteAddress + " "
    + this.req.method + " "
    + this.req.url + " "
    + this.req.headers.referer + ' "'
    + this.req.headers['user-agent'] + '" '
    + this.res.statusCode + ' "'
    + this.res.getHeader('Content-Type') + '" ('
    + this.res.getHeader('Content-Length') + "o) [" +duration+"ms]\n");
};

w.proto.debug = function noop(){}; //fallback if no debug middleware

w.mw.dlogger = function dlogger(next, done) {
    var start = Date.now();
    var datestring = w.dep.dateformat(start, "yyyy-mm-dd/HH:MM:ss");
    if (datestring.substring(0, 10) !== logday) {
      _closeLogStreams();
      _creatLogStreams();
    };
    
    dlogfs.write(datestring+ " "+ this.id
    + " *** [0ms] "
    + this.req.method + " " + this.req.url + "\n");
    
    this.debug = new debugLogger(this.id, start);
    next();
    var end = Date.now();
    var duration = end - start;
    var datestring = w.dep.dateformat(end, "yyyy-mm-dd/HH:MM:ss");
    dlogfs.write(datestring+ " "+this.id
    + " +++ [" +duration+"ms] "
    + this.res.statusCode + ' "'
    + this.res.getHeader('Content-Type') + '" ('
    + this.res.getHeader('Content-Length') +')\n', done);
};

function debugLogger(id, start) {
    return function() {
      var now = Date.now();
      var duration = now - start;
      var datestring = w.dep.dateformat(now, "yyyy-mm-dd/HH:MM:ss");
      for (var i=0; i<arguments.length; i++) {
        if (typeof(arguments[i]) === 'string') {
          dlogfs.write(datestring+ " " +id
            + " === [" +duration+"ms] " + arguments[i] + "\n")
        } else {
          dlogfs.write(datestring+ " " +id
            + " === [" +duration+"ms] " + w.dep.util.inspect(arguments[i]) + "\n")
        };
      };
    };
};
