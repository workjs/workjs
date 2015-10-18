#! /usr/bin/env node

var program = require('commander');
var path = module.require('path');
var fs = module.require('fs');
var wrench = require('wrench');

var package_json = path.join(__dirname, '../package.json');
var pkg = JSON.parse(fs.readFileSync(package_json).toString());

program
  .version(pkg.version)
  .usage('-c <name_of_your_project>')
  .option('-c, --create [name]', 'Create a new project')
  .parse(process.argv);

if (process.argv.slice(2).length !== 2) { program.help(); };

wrench.copyDirSyncRecursive(__dirname + '/../workshop', path.join(process.cwd(), program.create), {
  forceDelete: false, preserveFiles: true, preserveTimestamps: false
});
