var util = require('util');
var fs = module.require('fs');

var w = module.work;

var r = [];
var ro = {};

module.exports.get = function get_map(next) {
  for (var i = 0; i<w.verbs.length; ++i) {
    var verb = w.verbs[i];
    list(w.map[verb]);
  };
//  this.context.m = util.inspect(w.map, {depth:10});
//  this.context.r = util.inspect(ro, {depth:10});
  this.context.r = r;
  this.context.ro = ro;
  this.context.verbs = w.verbs;
  this.context.x = util.inspect(ro, {depth:10});
  r.sort();
  next();
};

function list(n) {
  if (!n) return;
  if (n.target) {
    console.log("N", n.target, n.verb);
    if (!ro[n.urlpath]) {
      r.push(n.urlpath);
      ro[n.urlpath] = {};
    };
    ro[n.urlpath][n.verb] = {};
    ro[n.urlpath][n.verb].n=n;
    var targetname = n.pkg.dirname+'/'+n.target;
    if (fs.existsSync(targetname+'.js')) {
      ro[n.urlpath][n.verb].controller = targetname+'.js';
    } else ro[n.urlpath][n.verb].controller = null;
    if (fs.existsSync(targetname+'.'+n.verb)) {
      ro[n.urlpath][n.verb].view = targetname+'.'+n.verb;
    } else ro[n.urlpath][n.verb].view = null;
    
    ro[n.urlpath][n.verb].flags=util.inspect(n.flags);
    var flags = "";
    for (var f in w.defaultflags) {
      if (n[f]) { flags += " +"+f; } else { flags += " -"+f; }
    };
    ro[n.urlpath][n.verb].flags=flags;
/*    if (ro[n.urlpath][n.verb].n.handler) {
      ro[n.urlpath][n.verb].handler=n.handler.toString();
    } else {
      ro[n.urlpath][n.verb].handler="";
    }
*/
  };
  for (b in n.branches) {
    list(n.branches[b]);
  };
};
