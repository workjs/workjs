
var DEVELOPMENT = (w.conf.servermode == "DEVELOPMENT");

w.httpserver = module.require('http').Server(listener);
w.httpserver.listen(w.conf.port);

require('./work-socket.js').server(w.httpserver);
require('./requestContext.js');

//////////////////////////////////////////////////////////////
// listener uses syncho to run each request in a fiber

function listener(req, res) {
  //req.setEncoding('utf8');
  w.dep.syncho(function request_handler() {
      var context = w.newRequestContext(req, res);
      route.call(context);
      if (context.error) {
        var e = context.error;
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

function route() {
  this.method = this.req.method.toLowerCase();
  var n = w.map[this.method];
  if (!n) { return this.reply4xx(404, "no route for method: "+this.req.method); };
  
  this.url = w.dep.url.parse(this.req.url, true);
  this.query = this.url.query || {};
  this.context = {};
  for (var e in this.query) { this.context[e] = this.query[e] }
  this.context._work = this;
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
    return this.reply4xx(404, "no route to: "+this.req.method+' '+this.req.url);
  };
  
  if (n.handler) {
    this.mapnode = n;
    n.handler.call(this);
  } else {
    //var util = require('util');
    //console.log(util.inspect(n, {depth:10}));
    return this.reply5xx(500, "no handler found for: "+this.req.method+' '+this.req.url);
  };
};
