var Sync = require('syncho');
var Work = require('./prototype.js');

var w = module.work;
var DEVELOPMENT = (module.work.conf.servermode == "DEVELOPMENT");

w.httpserver = module.require('http').Server(listener);
w.httpserver.listen(w.conf.port);

w.wsserver = require('./work-socket.js').server(w.httpserver);

//////////////////////////////////////////////////////////////
// listener uses syncho to run each request in a fiber

function listener(req, res) {
  //req.setEncoding('utf8');
  var work = new Work(req, res);
  Sync(function request_handler() {
      route.call(work);
      if (work.error) {
        var e = work.error;
        w.log("ERROR " + e.message + "\n\n" + e.stack);
        if (!res.headersSent) {
          var status = e.status || 500;
          var contenttype = e.contenttype || "text/plain";
          res.writeHead(status, {"Content-Type": contenttype});
          
          switch (status) {
            case 404: res.write("404 Not Found\n"); break;
            case 500:
            default:  res.write("500 Internal Server Error\n"); break;
          };
          
          if (DEVELOPMENT) {
            res.write(e.message);
            res.write("\n\n"+e.stack);
          };
          
          res.end();
        };
      };
  });
};

//////////////////////////////////////////////////////////////
// router runs in the "Work" object context

var url = require('url');

function route() {
  var n = w.map[this.req.method.toLowerCase()];
  if (!n) { return this.reply404("no route for method: "+this.req.method); };
  
  this.url = url.parse(this.req.url, true);
  this.context = this.query = this.url.query || {};
  this.context._js = [];
  this.context._css = [];
  
  var p = this.url.pathname.split('/');
  console.log(this.req.url, "route to ===============> " + this.req.method.toUpperCase(), p);
  
  for (var i = 1; i < p.length; ++i) {
    var segment = p[i];
    if (n.branches[segment]) { n = n.branches[segment]; continue };
    if (n.branches[':']) { //varname
        this.context[n.varname] = segment;
        console.log("//varname: " + n.varname + " = " + this.context[n.varname]);
        n = n.branches[':'];
        continue
    };
    if (n.branches['*']) { //wildcard
        this.context['_location'] = p.slice(i).join('/');
        console.log("//wildcard: " + this.context['_location']);
        n = n.branches['*'];
        n.handler.call(this);
        return
      };
    return this.reply404("no route to: "+this.req.method+' '+this.req.url);
  };
  
  if (n.handler) {
    n.handler.call(this);
  } else {
    //var util = require('util');
    //console.log(util.inspect(n, {depth:10}));
    return this.reply500("no handler found for: "+this.req.method+' '+this.req.url);
  };
};
