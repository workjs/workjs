var w = module.work;

//watch for change in map for autoreload in development mode
var DEVELOPMENT = (module.work.conf.servermode == "DEVELOPMENT");

function reload() {
  for (var pkgname in w.packages) {
    w.packages[pkgname].watcher.close();
  };
  parse();
};

function parse() {
  for (var i = 0; i<w.verbs.length; ++i) {
    var verb = w.verbs[i];
    var flags = w.flags[verb];

    w.map[verb] = new MAPnode();
    pass1(verb, w.coredir, '', flags);

    //until we know it better, we mount our application into the root of the core
    pass1(verb, w.rootdir, '', flags);

    build_handler(w.map[verb]);
  };

  if (DEVELOPMENT) {
    for (var pkgname in w.packages) {
      var dirname = w.packages[pkgname].dirname;
      console.log('DEVELOPMENT ---> Watch in '+dirname);
      var ignorepath = w.rootdir+"/node_modules|"
      + w.rootdir+"/LOG|"
      + w.rootdir+"/.git|"
      + w.rootdir+"/core";
      var re = new RegExp(ignorepath);
      w.packages[pkgname].watcher = w.dep.chokidar
      .watch('.', {cwd:dirname, ignored:re, ignoreInitial:true})
      .on('add', function(event, path) { reload(); })
      .on('change', function(path) { console.log("change ....", path); reload(); })
      .on('unlink', function(path) { reload(); });
    };
  };
};

//a node in our route map tree
function MAPnode(){
    this.id = null;
    this.urlpath = null;
    this.verb = null;
    this.target = null;
    this.flags = {};
///    this.modules = [];

    //slot for a ws controller
    this.ws = null;

    this.branches = {};
    this.varname = null;
    this.handler = null;
    
    this.pkg = null;
};

function add_to_route_map(urlpath, verb, target, flags, pkg, urlprefix) {
  console.log(">>>", pkg.name, verb, urlpath, target, urlprefix);
  var n = w.map[verb];
  var p = urlpath.split('/');
  
  for (var i = 1; i < p.length; ++i) {
    var segment = p[i];
    
    if (segment === '*') { //this is a wildcard route; must be the last segment!
      if (i < p.length -1) {
        w.log("ERROR [package_parser.add_to_route_map] invalid wildcard route: "+verb+":"+urlpath);
        return
      };
      if (Object.keys(n.branches).length !== 0) {
        w.log("ERROR [package_parser.add_to_route_map] invalid wildcard route, branch already taken: "+pkg.name+":"+verb+":"+urlpath);
        return
      };
      n = n.branches["*"] = new MAPnode();
      n.varname = '_location';
      break
    };
    
    if (segment[0] === ':') { //this segment defines a variable
      if (n.branches[':']) { //varname again - must be same
        if (n.varname && n.varname==segment.substr(1)) { //same var again -> ok
          n = n.branches[':'];
          continue
        } else {
          //do not allow different vars with same prefix
          w.log("ERROR [package_parser.add_to_route_map] different route parameter for same prefix: "+
            verb+":"+urlpath+" -- "+segment+" -- "+n.varname);
          w.log("WARN  [package_parser.add_to_route_map] dropping route: "+verb+":"+urlpath);
          return
        };
      };
      if (Object.keys(n.branches).length !== 0) {
        w.log("ERROR [package_parser.add_to_route_map] invalid wildcard route, branch already taken: "+pkg.name+":"+verb+":"+urlpath);
        return
      };
      //new variable
      n.varname = segment.substr(1);
      n = n.branches[':'] = new MAPnode();
      continue
    };
    
    if (segment in n.branches) {
      n = n.branches[segment];
      continue
    };
    
    n = n.branches[segment] = new MAPnode();
  };
  
  n.id = w.unique();
  n.target = target;
  n.verb = verb;
  n.urlpath = urlpath;
  n.flags = flags;
  n.pkg = pkg;
  n.moduleprefix = urlprefix;
};

//parse packages and modules
function pass1(verb, dirname, urlprefix, preflags) {
  //console.log('PASS1 in '+dirname, verb, preflags);
  //get package information
  var package_json = w.dep.path.join(dirname, 'package.json');
  var pkg = JSON.parse(w.dep.fs.readFileSync(package_json).toString());
  pkg.dirname = dirname;
  pkg.templating = module.require('./templating.js')({
    searchpaths: [dirname, dirname+'/LAYOUT', w.rootdir+'/LAYOUT', w.coredir+'/LAYOUT']
  });
  
  //run pkg init
  console.log("Load Package:", pkg.dirname, pkg.main);
  require(pkg.dirname);
  var mapfile = pkg.dirname + '/MAP';
  if (!w.dep.fs.existsSync(mapfile)) return;
  
  //store for developer support and watch
  w.packages[pkg.name] = pkg;
  
  //parse mapfile
  var mf = w.dep.fs.readFileSync(mapfile).toString().split('\n');
  mf.forEach( function parse(line) {
    if (line[0] === '#' || !/\S/.test(line)) return;
    
    // urlpath routeverb target routeflags
    var a = line.match(/^\s*(\S+)\s+(\S+)\s+(\S+)\s*(.*)$/);
    if (!a) {
      w.log('ERROR parsing mapfile "' + mapfile + '"');
      w.log('INVALID line : ' + line);
      return
    };
    var routeverb = a[2].toLowerCase();
    if (routeverb !== verb && routeverb !== '*') return;
    
    switch (a[1][0]) {
      case "@": var urlpath = urlprefix; break;
      case "=": var urlpath = a[1].substring(1); break;
      default: var urlpath = urlprefix + a[1];
    };
    
    var target = a[3];
    
    var rflags = Object.create(preflags);
    if (a[4]) try {
      var routeflags = JSON.parse(a[4]);
      if (routeflags && typeof routeflags === "object") {
        for (var f in routeflags) {
          if (typeof routeflags[f] === 'object') {
            if (routeflags[f][verb]) { 
              rflags[f] = (routeflags[f][verb] === 'T' || routeflags[f][verb] === 't')
            }
          } else { rflags[f] = (routeflags[f] === 'T' || routeflags[f] === 't'); };
        };
      } else { w.log('UNKNOWN flags in: ' + line); };
    } catch (e) {
      w.log('INVALID flags in: ' + line);
      w.log('ERROR parsing mapfile "' + mapfile + '": '+ e.message);
      return;
    };

    if (target[0] === ":") { //module mounted here
      var pkgname = target.substring(1);
      if (pkgname[0] === "/") { //absolute path start to resolve from core dir
        var basedir = w.coredir;
        var pkgname = "." + pkgname;
      } else var basedir = pkg.dirname;
      try {
        pkgdirname = w.dep.path.dirname(w.dep.resolve.sync(pkgname, { basedir: basedir }));
      } catch (e) {
        w.log('INVALID package ref in: ' + dirname + " >> " + line);
        w.log('ERROR parsing mapfile "' + mapfile + '": '+ e.message);
        return;
      };
      pass1(verb, pkgdirname, urlpath, rflags);
    } else {
      add_to_route_map(urlpath, verb, target, rflags, pkg, urlprefix);
    };
  });
};

function build_handler(n) {
  var util = require('util');
  if (n.target) {
//    var has_DB = false;
    var h = []; //list of functions (modules, controller, view) for this handler
    if (n.flags["access"]) h.push(w.mw.alogger);
    if (n.flags["debug"]) h.push(w.mw.dlogger);
    if (n.flags["formData"]) h.push(w.mw.body_parser);
    if (n.flags["dbCommit"]) h.push(w.dbm.commit);
    if (n.flags["dbRollback"]) h.push(w.dbm.rollback);
    if (n.flags["dbCommit"] && n.flags["dbRollback"])
      w.log('WARNING dbRollback AND dbCommit in ' + n.verb+' '+n.urlpath);
    if (n.flags["session"]) h.push(w.session.mw);
    if (n.flags["auth"]) if (n.flags["session"]) h.push(w.auth.mw) 
                         else { h.push(w.session.mw); h.push(w.auth.mw); };
    if (n.flags["ws"]) {
      h.push(w.ws_mw);
      w.ws_nodes[n.id] = {};
      console.log("load WS server for ", n.verb, n.urlpath);
    };

    //if null target -> we are finished
    if (n.target === '=') {
      n.handler = null;
    } else {
 
      var c_path = n.pkg.dirname+'/'+n.target+".js";
      if (w.dep.fs.existsSync(c_path)) {
        //console.log("look for controller: ", c_path);
        try { var c = module.work_require(c_path)[n.verb];
          //if (c) console.log("found!");
          if (c) h.push(function handler(next) {
            try {
              c.call(this, next);
            }
            catch (e) {
              w.log('ERROR in route handler: '+n.verb+' '+n.urlpath+' -> '+n.taget);
              this.error = e;
            };
          });
        } catch (e) {
          w.log('ERROR route to '+n.verb+' '+n.urlpath+' dropped');
          w.log(e);
        };
      };
      
      var v_path = n.pkg.dirname+'/'+n.target+"."+n.verb;
      if (w.dep.fs.existsSync(v_path)) {
        try {
          var v = n.pkg.templating.compile(v_path);
          if (v) h.push(function render_template(next) {
            this.body = v.render.sync(v, this.context);
            this.end(); //shortcut we are last
            // next();
          });
        } catch (e) {
          w.log('ERROR route to '+n.verb+' '+n.urlpath+' dropped');
          w.log(e);
        };
      };
      
      //add route only if c or v
      if (c || v) { n.handler = compose(0, h); }
      else { 
        console.log("#### NO controller and NO view found for: "+n.verb+' '+n.urlpath+' -> '+n.taget);
        n.handler = function(){ if (!this.res.headersSent) { this.end(); }; };
      };
      
      //check for ws handler
      var ws_path = n.pkg.dirname+'/'+n.target+".ws";
      if (w.dep.fs.existsSync(ws_path)) {
        try { n.ws = module.work_require(ws_path);
        } catch (e) {
          w.log('ERROR in WS handler: '+ws_path);
          w.log(e);
          w.log(e.stack);
        };
      };
    };
  };
  
  for (var b in n.branches) { build_handler(n.branches[b]); };
};

function compose(i, mwstack){
  if (i < mwstack.length) {
    var f = mwstack[i];
    var g = compose(i+1, mwstack);
    return function(){
      f.call(this, g.bind(this));
    };
  } else {
    return function(){
      if (!this.res.headersSent) { this.end(); };
    };
  };
};


parse();
