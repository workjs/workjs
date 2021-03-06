
var r = [];
var ro = {};

module.exports.get = function get_map(next) {
  for (var i = 0; i<w.verbs.length; ++i) {
    var verb = w.verbs[i];
    list(w.map[verb]);
  };
  this.context.r = r;
  this.context.ro = ro;
  this.context.verbs = w.verbs;

  this.context.x = w.util.inspect(w.map);
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
    if (w.dep.fs.existsSync(targetname+'.js')) {
      ro[n.urlpath][n.verb].controller = targetname+'.js';
    } else ro[n.urlpath][n.verb].controller = null;
    if (w.dep.fs.existsSync(targetname+'.'+n.verb)) {
      ro[n.urlpath][n.verb].view = targetname+'.'+n.verb;
    } else ro[n.urlpath][n.verb].view = null;
    
    ro[n.urlpath][n.verb].flags=w.dep.util.inspect(n.flags);
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
