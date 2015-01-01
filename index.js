// workJS core and glue module
// create koa application
// extend module prototype
// create and use router
// create http and websocket server
// watch files for auto hot-reloading

console.log("LOADING WorkJS CORE");

//init global work object
var Module = require('module');
var w = module.exports = Module.prototype.work = {};

//load configuration
//w.rootdir = path.dirname(require.main.filename);
w.rootdir = process.cwd();
w.conf = module.require(w.rootdir + '/configuration');
w.debug = (w.conf.mode == 'DEVELOPMENT');

if (w.conf.verbs) { w.verbs = w.conf.verbs
} else { w.verbs = ["get", "post", "put", "head", "delete", "options",
  "trace", "copy", "lock", "mkcol", "move", "propfind", "proppatch",
  "unlock", "report", "mkactivity", "checkout", "merge", "m-search",
  "notify", "subscribe", "unsubscribe", "patch", "search"]
};

w.coredir = __dirname;
w.static_middleware = ["FS"];

//load templating subsystem
var templating = module.require('work-templating')({path: w.rootdir + '/layouts'});
w.template_compile = templating.compile;
w.template_render = templating.render;

//load database subsystem
//w.db = require('work-pg')({dburl: w.db_url, poolsize: w.db_poolsize});

//load content repository subsystem
/*
var crm = require('./core/cr/crm');
if (w.cr_root) {
  if (w.cr_root[0] === '/') {
    w.cr = crm.crmgr(w.cr_root, w.cr_partition);
  } else {
    w.cr = crm.crmgr(w.rootdir + '/' + w.cr_root, w.cr_partition);
  };
};
w.cr_uploaddir = cr.entrance;
*/

//load email module
// var smtp = require('./core/smtp').smtp(w.smtp_transport, w.smtp_user, w.smtp_password);

////////////////////////////////////////////////////////////////////////

w.app = require('koa')();
w.app.work = w;
w.app.keys = w.conf.session_secrets;

////////////////////////////////////////////////////////////////////////

w.router = module.require('work-router')();

/// -> move into router??
w.add_js = function add_js(controler, work_key, target) {
  console.log("add_js:", '//' + work_key + '/' + target);
  controler.locals._js.push('//' + work_key + '/' + target); };
w.add_css = function add_css(controler, work_key, target) {
  controler.locals._css.push('//' + work_key + '/' + target); };

  
w.app.use(w.router);
  
w.httpserver = module.require('http').Server(w.app.callback());
w.woss = module.require('work-socket').server({server: w.httpserver, keys: w.app.keys});
  
w.httpserver.listen(w.conf.port);
