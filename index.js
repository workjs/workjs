//workJS core and glue

var modules = {};
module.exports.modules = modules;

var conf = {media_prefix: '/_'};
module.exports.conf = conf;

module.exports.register = function workjs(key, opts) {
  var w = new work(key, opts);
  return(w);
};

function work(key, opts) {
  this.key = key;
  
  if (key === 'main') {
    conf.media_prefix = '/' + (opts && opts.media_prefix || '_');
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
