
var mkdirp = module.require('mkdirp');
var fs = module.require('fs');
var util = require('util');
var dateformat=require("dateformat");

module.exports = function(options) {
  var alogdir, dlogdir, mlogdir, logday;
  var alogfs, dlogfs, mlogfs;
  if (options.logdir) {
    alogdir = dlogdir = mlogdir = options.logdir + '/';
    mkdirp.sync(logdir, null);
  };
  if (options.alogdir) {
    alogdir = options.alogdir + '/';
    mkdirp.sync(alogdir, null);
  };
  if (options.dlogdir) {
    dlogdir = options.dlogdir + '/';
    mkdirp.sync(dlogdir, null);
  };
  if (options.mlogdir) {
    mlogdir = options.mlogdir + '/';
    mkdirp.sync(mlogdir, null);
  };
  _creatLogStreams();
  return {message:MLogger, access:ALogger, debug:DLogger};
  
  function _creatLogStreams() {
    var now = Date.now(); 
    var logday = dateformat(now, "yyyy-mm-dd");

    mlogfs = fs.createWriteStream(mlogdir+logday+'.log', {flags:'a'});
    mlogfs.on('error', function(e){ console.log('error: ', e); });
  
    if (alogdir === mlogdir) { alogfs = mlogfs;
    } else {
      alogfs = fs.createWriteStream(alogdir+logday+'.log', {flags:'a'});
      alogfs.on('error', function(e){ console.log('error: ', e); });
    };
    
    if (dlogdir === mlogdir) { dlogfs = mlogfs;
    } else if (dlogdir === alogdir) { dlogfs = alogfs;
    } else {
      dlogfs = fs.createWriteStream(dlogdir+logday+'.log', {flags:'a'});
      dlogfs.on('error', function(e){ console.log('error: ', e); });
    };
  };
  
  function _closeLogStreams() {
    mlogfs.end();
    if (alogdir !== mlogdir) alogfs.end();
    if (dlogdir !== mlogdir && dlogdir !==alogdir) dlogfs.end();
  };
  
  function MLogger() {
    var now = Date.now(); 
    var datestring = dateformat(now, "yyyy-mm-dd/HH:MM:ss");
    if (datestring.substring(0, 9) !== logday) {
      _closeLogStreams();
      _creatLogStreams();
    };
    
    if (!this.id) { this.id = "---"; }
    for (var i=0; i<arguments.length; i++) {
      mlogfs.write(datestring+" "+this.id+" ### "+util.inspect(arguments[i], {depth:6})+"\n");
    };
  };

  function ALogger(next) {
    var start = Date.now();
    next();
    var end = Date.now();
    var duration = end - start;
    var now = dateformat(end, "yyyy-mm-dd/HH:MM:ss");
    if (now.substring(0, 9) !== logday) {
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

  function DLogger(next, done) {
    var start = Date.now();
    var datestring = dateformat(start, "yyyy-mm-dd/HH:MM:ss");
    if (datestring.substring(0, 9) !== logday) {
      _closeLogStreams();
      _creatLogStreams();
    };
      
    dlogfs.write(datestring+ " "+ this.id
    + " *** [0ms] "
    + this.req.method + " " + this.req.url + "\n");

    this.debug = new Logger(this.id, start).log;
    next();
    
    var end = Date.now();
    var duration = end - start;
    var datestring = dateformat(end, "yyyy-mm-dd/HH:MM:ss");
    dlogfs.write(datestring+ " "+this.id
    + " +++ [" +duration+"ms] "
    + this.res.statusCode + ' "'
    + this.res.getHeader('Content-Type') + '" ('
    + this.res.getHeader('Content-Length') +')\n', done);
  };

  function Logger(id, start) {
    this.log = function() {
      var now = Date.now();
      var duration = now - start;
      var datestring = dateformat(now, "yyyy-mm-dd/HH:MM:ss");
      for (var i=0; i<arguments.length; i++) {
        dlogfs.write(datestring+ " " +id
        + " === [" +duration+"ms] " + util.inspect(arguments[i]) + "\n");
      };
    };
  };

};
