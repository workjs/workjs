var nunjucks =  module.require('nunjucks');
var path = module.require('path');

module.exports = function(opts) {
  var searchpaths = opts.searchpaths;
//  var watch = false;

//  var autoescape = true;
//  var eagerCompile = true;
//  var tags

//  var noCache = true;
  
  var loader = new nunjucks.FileSystemLoader(searchpaths, {noCache:false, watch:false});
//  console.log("loader .......", loader.searchPaths);
  
  var env = new nunjucks.Environment(
    loader,
    {dev:true, autoescape:true}
  );
  
  function compile(name) {
///    console.log("compile template ....", name);
//    console.log("loader ..", loader.cache);
    loader.emit('update', name);
//    console.log("loader .... path.relative: ");
//    console.log("name:", name);
//    console.log("searchpaths:", searchpaths);
//    console.log("path.relative:", path.relative(searchpaths[0], name));
    return env.getTemplate(name, true);
/*    return env.getTemplate(
      path.relative(searchpaths[0], name),
      eagerCompile
    );
*/
  };
  
  return {compile:compile};

};

/* use:

var compile = require('./templating.js')({searchpaths: [conf.rootdir, conf.rootdir+'/layouts']});

var v = compile(v_path);

this.body = v.render(this.context);
 
*/
