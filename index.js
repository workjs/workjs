//workJS core and glue

var koa = require('koa');
var app = koa();

var modules = {};
module.exports.modules = modules;

var conf = {};
module.exports.conf = conf;

module.exports.register = function workjs(key, opts) {
  var w = new work(key, opts);
  return(w);
};

function work(key, opts) {
  this.key = key;
  this.app = app;
  console.log("REGISTER module <", key, ">");
  
  if (key === 'main') {
    conf.media_prefix = '/' + (opts && opts.media_prefix || '_');
    
    app.work = {
      dirname: opts.dirname,
      config: require(__dirname+'/configuration'),
      app: app
    };
    
    app.keys = app.work.config.session_secrets;
    
    app.work.db = app.work.config.db;
    //app.work.cr = app.work.config.cr;
    
    var middlewares = [];
    
    middlewares.push({key:'ws', fn:require('work-socket').mw});
    middlewares.push({key:'FS', fn:require('work-fileserver')()});
    middlewares.push({key:'CSRF', fn:require('work-csrf')({sysurl:app.work.config.sysurl})});
    middlewares.push({key:'session', fn:require('work-session')()});
    middlewares.push({key:'MiA', fn:MA});
    if (app.work.db) middlewares.push({key:'dbR', fn:app.work.db.rollback});
    if (app.work.db) middlewares.push({key:'dbC', fn:app.work.db.commit});
    middlewares.push({key:'form', fn:require('work-body').form({limit:'100kb'})});
    middlewares.push({key:'json', fn:require('work-body').json({limit:'2mb'})});
    middlewares.push({key:'multipart', fn:require('work-body')
             .multipart({uploadDir:__dirname+'/incoming', hash:'MD5'})});
    middlewares.push({key:'MiB', fn:MB()});
    middlewares.push({key:'MiC', fn:MC()});
    middlewares.push({key:'tma', fn:testA()});
    middlewares.push({key:'tmb', fn:testB()});
    middlewares.push({key:'tmc', fn:testC()});
    
    app.router = require('work-router')({
      middlewares: middlewares,
      static_middlewares: ["FS{root:'static'}"],
      dirname: opts.dirname,
      template_compile: app.work.config.template_compile,
      template_render: app.work.config.template_render,  
      watch: app.work.config.DEVELOPMENT
    });
    
    app.use(app.router);
    
    var httpserver = require('http').Server(app.callback());
    var woss = require('work-socket').server({server: httpserver, keys: app.keys});
    httpserver.listen(app.work.config.port);
  };

  //register dirname only once, i.e. multiple registrations on the same module 
  // result in only one file system path
  if (opts && opts.dirname && !modules[key]) {
    modules[key] = {dirname: opts.dirname};
  };
  
};

work.prototype.media_url = function static_url(target) {
  return(conf.media_prefix + '/' + this.key + '/' + target);
};

//add script reference to page
work.prototype.add_js = function add_js(mod, target) {
  mod.locals.__js.push(this.media_url(target));
};

function *MA(next){
      console.log("LOG MA Start", this.sessionKey, this.sessionOptions);
      yield* next;
      console.log("LOG MA End", this.session, this.locals);
};

function MB(opts) {
    return function *MB(next){
      console.log("LOG MB Start");
      yield* next;
      console.log("LOG MB End");
    };
};

function MC(opts) {
  return function MC(opts) {
    return function *MC(next){
      console.log("LOG MC Start");
      yield* next;
      console.log("LOG MC End");
    };
  };
};

function testA(opts) {
    return function *testA(next){
      this.set('X-TestX', 'A');
      this.set('X-TestY', 'A');
      yield* next;
    };
};

function testB(opts) {
    return function *testB(next){
      this.set('X-TestX', 'B');
      yield* next;
    };
};

function testC(opts) {
    return function *testC(next){
      this.set('X-TestX', 'C');
      yield* next;
    };
};

                  