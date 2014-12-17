//// redefine module.require for work

var Module = require('module');
var fs = require('fs');
var node_path = require('path');
var resolve = require('resolve');
var pkginfo = require('./pkginfo');


Module.prototype.require_orig = Module.prototype.require;
var w = Module.prototype.work = {};

w.packages = {};
w.clientMod = {};
w.clientFn = {};

/*
Module.prototype.load_orig = Module.prototype.load;
Module.prototype.load = function(m) {
  console.log("LOAD", m);
  return this.load_orig(m);
};
*/

Module.prototype.require = function(path, cb) {
  var filename = resolve.sync(path, { basedir: node_path.dirname(this.filename) });
  if (filename[0] !== '/') return this.require_orig(path);
  
  var info = pkginfo.read(filename);
  w.packages[info.name] = info;
  
  Module.prototype.watch(filename, cb);
  return this.require_orig(path);
};

var watchlist = {};
var watchTimeout={};

Module.prototype.watch = function watch(f, cb) {
  if (cb) {
    w.clientFn[f] = w.clientFn[f] || [];
    if (w.clientFn[f].indexOf(cb) >= 0) return;
    w.clientFn[f].push(cb);
  } else {
    w.clientMod[f] = w.clientMod[f] || {};
    if (w.clientMod[f]) return;
    w.clientMod[f] = true;
  };

  if (watchlist[f]) return;
  watchlist[f] = true;

  var watchfile = f;
  fs.watch(f, function watch_reload(event, fn) {
    if (watchTimeout[watchfile]) return;
    watchTimeout[watchfile] = setTimeout(function() { watchTimeout[watchfile] = null; }, 2000);

    console.log("WATCH Reload:", watchfile);
    // first flush all involved caches
    // then call the controller callbacks which will reload the modules
    
    var reload_list = {};
    
    function delete_cache(filename) {
      if (reload_list[filename]) return;
      console.log("DELETE Require Cache", filename);
      delete require.cache[filename];
      reload_list[filename] = true;
      for (var cm in w.clientMod[filename]) delete_cache(cm);
    };
    
    delete_cache(watchfile);

    var cb_arr = [];
    for (var m in reload_list) {
      var cbs = w.clientFn[m];
      w.clientFn[m] = [];
      for (var f in cbs) {
        var cb = cbs[f];
        if (cb_arr.indexOf(cb) >= 0) continue;
        cb_arr.push(cb);
        cb.call({});
      };
    };
  });

};
