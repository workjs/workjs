// modified code from https://github.com/indexzero/node-pkginfo 
// Copyright (c) 2010 Charlie Robbins.

var fs = require('fs');
var path = require('path');

var pkginfo = module.exports = function (pmodule) {

  var include = [].slice.call(arguments, 1);

  return pkginfo;
};



pkginfo.find = function (pmodule, dir) {
  if (! dir) {
    dir = path.dirname(pmodule.filename);
  }
  
  var files = fs.readdirSync(dir);
  
  if (~files.indexOf('package.json')) {
    return path.join(dir, 'package.json');
  }
  
  if (dir === '/') {
    throw new Error('Could not find package.json up from: ' + dir);
  }
  else if (!dir || dir === '.') {
    throw new Error('Cannot find package.json from unspecified directory');
  }
  
  return pkginfo.find(pmodule, path.dirname(dir));
};

pkginfo.read = function (pmodule) {
  var package_json = pkginfo.find(pmodule, "");
  var data = JSON.parse(fs.readFileSync(package_json).toString());
  data.dirname = path.dirname(package_json);
  
  return data;
};
