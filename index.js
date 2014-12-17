// workJS core and glue module
// create koa application
// extend module prototype
// create and use router
// create http and websocket server
// watch files for auto hot-reloading

console.log("LOADING WorkJS CORE");

var fs = require('fs');
var path = require('path');

require('./lib/work-module');
var w = module.exports = module.work;

//w.rootdir = path.dirname(require.main.filename);
w.rootdir = process.cwd();
if (fs.existsSync(w.rootdir + '/configuration')) {
  w.conf = module.require(w.rootdir + '/configuration');
} else {
  w.conf = {};
  console.log("WARN - Configuration file NOT found at: "+w.rootdir + '/configuration');
};

var templating = module.require_orig('work-templating')({path: w.rootdir + '/layouts'});
w.template_compile = templating.compile;
w.template_render = templating.render;

w.add_js = function add_js(controler, work_key, target) {
  controler.locals._js.push('/' + work_key + '/' + target); };
w.add_css = function add_css(controler, work_key, target) {
  controler.locals._css.push('/' + work_key + '/' + target); };

//w.db = require('work-pg')({dburl: w.db_url, poolsize: w.db_poolsize});

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

// var smtp = require('./core/smtp').smtp(w.smtp_transport, w.smtp_user, w.smtp_password);

w.app = require('koa')();
w.app.work = w;
w.app.keys = w.conf.session_secrets;

////////////////////////////////////////////////////////////////////////

//var core_middlewares = require('./middlewares')();

w.coredir = __dirname;

if (w.conf.verbs) { w.verbs = w.conf.verbs
} else { w.verbs = ["get", "post", "put", "head", "delete", "options",
  "trace", "copy", "lock", "mkcol", "move", "propfind", "proppatch",
  "unlock", "report", "mkactivity", "checkout", "merge", "m-search",
  "notify", "subscribe", "unsubscribe", "patch", "search"]
};

w.static_middlewares = ["FS"];

w.router = module.require_orig('work-router');

w.router.init(w);

w.router.addStatic();
  
w.app.use(w.router.route);
  
w.httpserver = require('http').Server(w.app.callback());
w.woss = require('work-socket').server({server: w.httpserver, keys: w.app.keys});
  
w.httpserver.listen(w.conf.port);
