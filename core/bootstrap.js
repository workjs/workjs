var Sync = require('syncho');

global.work = {};

//init global work object
var Module = require('module');
var w = Module.prototype.work = {};

w.dependencies = {};
w.dependencies.cookies = module.require('cookies');

//work_require for autoreload in development mode defaults to require
Module.prototype.work_require = Module.prototype.require;

var fs = module.require('fs');

//create unique ID from Date.now
w.lastID = 0;
w.unique = function unique() {
  var u = Date.now();
  while (u <= w.lastID) u++;
  w.lastID = u;
  return u;
};

module.exports = function bootstrap(conf) {

w.conf = conf;
w.runid = Date.now();

if (conf.servermode.toUpperCase() == "DEVELOPMENT") {
  Module.prototype.work_require = function requireUncached(module){
    delete require.cache[require.resolve(module)];
    return require(module);
  };
};

//set some work globals
w.coredir = w.conf.coredir;
w.rootdir = w.conf.rootdir;

w.verbs = [];
for (var i = 0; i<w.conf.verbs.length; ++i)
       w.verbs.push(w.conf.verbs[i].toLowerCase());

//define default flags
w.flags = {};
w.flags.get = { "logAccess": true, "logDetail": true, "formData": false,
  "dbCommit": false, "dbRollback": true, "session": true };
w.flags.post = { "logAccess": true, "logDetail": true, "formData": true,
  "dbCommit": true, "dbRollback": false, "session": true };
w.defaultflags = w.conf.defaultflags || { "logAccess": true, "logDetail": true, "formData": true,
  "dbCommit": true, "dbRollback": false, "session": true };

w.logger = require("./logger.js")({
  alogdir:w.conf.access_logdir,
  dlogdir:w.conf.debug_logdir,
  mlogdir:w.conf.message_logdir
});

//fallback log function to be used if not in any Work (request) context
w.log = w.logger.message;

w.log("Work starting >>> " + w.conf.name);

//load templating subsystem
///w.templating = module.require('./templating.js')({
///  searchpaths: [w.rootdir, w.rootdir+'/LAYOUT']
///});

//load database subsystem
w.dbm = require('./postgres.js')({dburl:w.conf.db_url, poolsize:w.conf.db_poolsize});
w.db = w.dbm.db;

//install required DB contents
Sync(function setup() {

//load global db fkts
///// deleted !! var dbfkt = require("./db.js");

  //load session subsystem
  require('./session.js');

try { fs.mkdirSync(w.conf.uploaddir); } catch (e) { };

/////YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
//w.Work = require("./Work.js");
//w.Work.prototype.work = w;

require("./body_parser.js");

//parse packages into route map
w.map = {};
w.packages = {};

require("./package_parser.js");

//start requests processor
require("./request_processor.js");

});

};
