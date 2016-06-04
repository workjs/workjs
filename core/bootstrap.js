//global.work = {};

//init global work object
//create context prototype
const context = {};
global.w = Object.create(context);
w.proto = context;

const Module = require('module');

//const orig_require = Module.prototype.require;
//Module.prototype.require = function(id){ return orig_require(id); }
//Module.prototype.require = function(id){ return orig_require.call(this, id); }

//create context prototype
////const context = {};
//context.proto = context;

//create global work context
////const w = Module.prototype.work = Object.create(context);
////w.proto = context;

require("./doc.js");

require("./dependencies.js");

w.mw = {};
w.cache = {};

//work_require for autoreload in development mode defaults to require
Module.prototype.work_require = Module.prototype.require;

w.proto.rootdir = process.cwd();
w.proto.coredir = __dirname.replace("/core", "");

w.conf = {};
require("../CONF");
require(w.rootdir+"/CONF");

require("./work.js");
require("./logger.js");

w.log("WorkJS starting >>> " + w.conf.name);

if (w.conf.servermode.toUpperCase() == "DEVELOPMENT") {
  Module.prototype.work_require = function requireUncached(module){
    delete require.cache[require.resolve(module)];
    return require.call(w, module);
  };
};

w.verbs = [];
w.flags = {};
for (var i = 0; i<w.conf.verbs.length; ++i) {
  var verb = w.conf.verbs[i];
  w.verbs.push(verb);
  w.flags[verb] = w.conf.flags[verb] || w.conf.flags["default"]
};

//load templating subsystem
///w.templating = module.require('./templating.js')({
///  searchpaths: [w.rootdir, w.rootdir+'/LAYOUT']
///});

//load database subsystem

//w.dbm = require('./pg_native.js')({dburl:w.conf.db_url, poolsize:w.conf.db_poolsize});
//w.db = w.dbm.db;
//install required DB contents

w.dep.syncho(function setup() {

  require('./pg.js');
  require('./db.js');
  
  require('./cookies.js');

//load global db fkts
///// deleted !! var dbfkt = require("./db.js");
  require('./util.js');

  //load session subsystem
  require('./session.js');
  
  //load user+auth subsystem
  require('./auth.js');
  
  require('./groups.js');
  
  //load email subsystem
  require('./smtp.js');
  
  //load content repository subsystem
  require('./repo.js');
  
  require('./work-socket.js');

try { w.dependencies.fs.mkdirSync(w.conf.uploaddir); } catch (e) { };

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

w.api_doc.init();

});
