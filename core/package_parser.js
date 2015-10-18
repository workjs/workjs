var path = module.require('path');
var fs = module.require('fs');
var chokidar = require('chokidar');
var resolve = require('resolve');

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
    w.map[verb] = new MAPnode();
    var flags = pass1(verb, w.coredir, '', {});
    //we mount our application into the root of the core
    flags = pass1(verb, w.rootdir, '', flags);
    build_handler(w.map[verb]);
  };

  if (DEVELOPMENT) {
    for (var pkgname in w.packages) {
      var dirname = w.packages[pkgname].dirname;
      console.log('DEVELOPMENT ---> Watch in '+dirname);
      var ignorepath = dirname+"/node_modules|"
      + dirname+"/LOG|"
      + dirname+"/.git|"
      + dirname+"/core";
      var re = new RegExp(ignorepath);
      w.packages[pkgname].watcher = chokidar
      .watch('.', {cwd:dirname, ignored:re, ignoreInitial:true})
      .on('add', function(event, path) { reload(); })
      .on('change', function(path) { reload(); })
      .on('unlink', function(path) { reload(); });
    };
  };
};

//a node in our route map tree
function MAPnode(){
    this.urlpath = null;
    this.verb = null;
    this.target = null;
    this.flags = {};
///    this.modules = [];

    this.branches = {};
    this.varname = null;
    this.handler = null;
    
    this.pkg = null;
};

MAPnode.prototype.hasFlag = function(f) {
  return (this.flags[f] === "t" || this.flags[f] === "T" ||
          (typeof(this.flags[f]) === 'object' &&
           (this.flags[f][this.verb] === "t" 
            || this.flags[f][this.verb] === "T")))
};

function add_to_route_map(urlpath, verb, target, flags, pkg) {
//  console.log("add_to_route_map ....", verb, urlpath, target, flags);
  
  var n = w.map[verb];
  var p = urlpath.split('/');
  
  for (var i = 1; i < p.length; ++i) {
    var segment = p[i];
    
    if (segment === '*') { //this is a wildcard route; must be the last segment!
      if (i < p.length -1) {
        w.log("ERROR [package_parser.add_to_route_map] invalid wildcard route: "+verb+":"+urlpath);
        return
      };
      n = n.branches["*"] = new MAPnode();
      n.varname = '_location';
      break
    };
    
    if (segment[0] === ':') { //this segment defines a variable
      if (':' in n.branches) { //varname again - must be same
        if (n.varname && n.varname==segment.substr(1)) { //same var again -> ok
          n = n.branches[':'];
          continue
        };
        //do not allow different vars with same prefix
        w.log("ERROR [package_parser.add_to_route_map] different route parameter for same prefix: "+
            verb+":"+urlpath+" -- "+segment+" -- "+n.varname);
        w.log("WARN  [package_parser.add_to_route_map] dropping route: "+verb+":"+urlpath);
        return
      }
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
  
  n.target = target;
  n.verb = verb;
  n.urlpath = urlpath;
  n.flags = flags;
  n.pkg = pkg;
};

//parse packages and modules
function pass1(verb, dirname, urlprefix, preflags) {
  console.log('PASS1 in '+dirname, verb, preflags);
  //get package information
  var package_json = path.join(dirname, 'package.json');
  var pkg = JSON.parse(fs.readFileSync(package_json).toString());
  pkg.dirname = dirname;
  pkg.templating = module.require('./templating.js')({
    searchpaths: [dirname, dirname+'/LAYOUT', w.rootdir+'/LAYOUT', w.coredir+'/LAYOUT']
  });
  
  var mapfile = pkg.dirname + '/MAP';
  if (!fs.existsSync(mapfile)) return;
  
  //store for developer support and watch
  w.packages[pkg.name] = pkg;
  
/*  //merge flags
  var flags = {};
  for (var f in preflags) { flags[f] = preflags[f]; };
  //merge package flags
  if (pkg.config && pkg.config['work-flags']) {
    var workflags = pkg.config['work-flags'];
    for (var f in workflags) {
      if (flags[f]) {
        if (flags[f] === 't' || flags[f] === 'f') {
          if (typeof workflags[f] === 'object') {
            if (workflags[f][verb]) flags[f] = workflags[f][verb];
          } else {
            flags[f] = workflags[f];
          };
        };
      } else {
        if (typeof workflags[f] === 'object') {
          if (workflags[f][verb]) flags[f] = workflags[f][verb];
        } else {
          flags[f] = workflags[f];
        };
      };
    };
  }; */
  
  var flags = Object.create(preflags);
  //merge package flags
  if (pkg.config && pkg.config['work-flags']) {
    var workflags = pkg.config['work-flags'];  
    for (var f in workflags) {
      if (typeof workflags[f] === 'object') {
        if (workflags[f][verb]) flags[f] = workflags[f][verb];
      } else { flags[f] = workflags[f]; };
    };
  };
  
  //parse mapfile
  var mf = fs.readFileSync(mapfile).toString().split('\n');
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
    
    var urlpath = (a[1][0] === '=') ? a[1].substring(1) : urlprefix + a[1];
    var target = a[3];
    
    var rflags = Object.create(flags);
    if (a[4]) try {
      var routeflags = JSON.parse(a[4]);
      if (routeflags && typeof routeflags === "object") {
        for (var f in routeflags) {
          if (typeof routeflags[f] === 'object') {
            if (routeflags[f][verb]) { rflags[f] = routeflags[f][verb];
            } else if (routeflags[f]['*']) { rflags[f] = routeflags[f]['*']; };
          } else { rflags[f] = routeflags[f]; };
        };
      } else { w.log('UNKNOWN flags in: ' + line); };
    } catch (e) {
      w.log('INVALID flags in: ' + line);
      w.log('ERROR parsing mapfile "' + mapfile + '": '+ e.message);
      return;
    };

    if (target[0] === ":") {
      var pkgname = target.substring(1);
      try {
        pkgdirname = path.dirname(resolve.sync(pkgname, { basedir: pkg.dirname }));
      } catch (e) {
        w.log('INVALID package ref in: ' + line);
        w.log('ERROR parsing mapfile "' + mapfile + '": '+ e.message);
        return;
      };
      pass1(verb, pkgdirname, urlpath, rflags);
    } else {
      add_to_route_map(urlpath, verb, target, rflags, pkg);
    };
  });
  
  //return merged flags
  return flags;
};

function build_handler(n) {
  var util = require('util');
//  console.log("**** build_handler " +n.verb+": "+n.urlpath+" -> "+n.target);
//  console.log(util.inspect(n.flags, {depth:2}));
  if (n.target) {
    var has_DB = false;
    var h = []; //list of functions (modules, controller, view) for this handler
    if (n.hasFlag("logAccess")) { h.push(w.logger.access); }
    if (n.hasFlag("logDetail")) { h.push(w.logger.debug); }
    if (n.hasFlag("formData")) { h.push(w.parseForm); }
    if (n.hasFlag("dbCommit") || n.hasFlag("session")) { h.push(w.dbm.commit); has_DB = true; }
    if (!has_DB && n.hasFlag("dbRollback")) { h.push(w.dbm.rollback); has_DB = true; }
    if (n.hasFlag("session")) { h.push(w.session.get_session); }
    //if null target -> we are finished
    if (n.target === '=') {
      n.handler = null;
    } else {
      var c_path = n.pkg.dirname+'/'+n.target+".js";
      var v_path = n.pkg.dirname+'/'+n.target+"."+n.verb;

      if (fs.existsSync(c_path)) {
        try { var c = module.work_require(c_path)[n.verb]; if (c) h.push(c);
        } catch (e) {
          w.log('ERROR route to '+n.verb+' '+n.urlpath+' dropped');
          w.log(e);
        };
      };
      
      if (fs.existsSync(v_path)) {
        try {
          var v = n.pkg.templating.compile(v_path);
          if (v) h.push(function render_template(next) {
            this.body = v.render.sync(v, this.context);
            this.end(); //shorcut we are last
            // next();
          });
        } catch (e) {
          w.log('ERROR route to '+n.verb+' '+n.urlpath+' dropped');
          w.log(e);
        };
      };
      
      //add route only if c or v
      if (c || v) { n.handler = compose(0, h); } else { n.handler = null; }
    };
  };
  
  for (var b in n.branches) { build_handler(n.branches[b]); };
};

function compose(i, mwstack){
//  console.log("+++++ compose mwstack:", i, mwstack, mwstack[i]);
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
