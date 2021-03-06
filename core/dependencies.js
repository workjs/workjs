
w.module("dep", `These are the external dependencies.`);

w.dep.base64url = module.require('base64url');
w.dep.bcrypt = module.require('bcrypt');

w.dep.chokidar = module.require('chokidar');
w.dep.cookies = module.require('cookies');
w.dep.cookie = module.require('cookie');
w.dep.crypto = module.require('crypto');

w.dep.dateformat = module.require("dateformat");

w.dep.fs = module.require('fs');

w.dep.hljs = module.require('highlight.js');

w.dep.json_stringify_safe = module.require('json-stringify-safe');

w.dep.keygrip = module.require('keygrip');

w.dep.marked = module.require('marked');
w.dep.mkdirp = module.require('mkdirp');

w.dep.nodemailer = module.require('nodemailer');

w.dep.path = module.require('path');

//select pg or pg-native
//w.dep.pgClient = module.require('pg');
//delete w.dep.pgClient.native; //remove setter if not native bindings
//w.dep.pgClient = module.require('pg-native');
w.dep.pg_native = module.require('pg-native');

w.dep.resolve = module.require('resolve');

w.dep.send = require('send');
w.dep.syncho = require('syncho');

w.dep.url = require('url');
w.dep.util = require('util');

w.dep.ws = require('ws');

//////////////////////////////////

w.dep.marked.setOptions({
  highlight: function (code, lang) {
    if (lang) {
      return w.dep.hljs.highlightAuto(code, [lang]).value;
    } else {
      return w.dep.hljs.highlightAuto(code).value;
    }
  }, 
  renderer: new w.dep.marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
});
