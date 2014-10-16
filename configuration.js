module.exports.DEVELOPMENT = true; //set false for production mode

module.exports.port = 3000;

//sysurl should end with a "/" to enable save referer checks to prevent csrf attacks
module.exports.sysurl = "http://localhost:3000/";

module.exports.session_secrets = ["Top Secret"];

var templating = require('work-templating')({path: __dirname + '/layouts'});
module.exports.template_compile = templating.compile;
module.exports.template_render = templating.render;

/*
module.exports.ERR404 = "error 404";
module.exports.multipart_limit = "200mb";
module.exports.upload_hash = "md5";
*/

var db = require('work-pg')({dburl:'pg://fp@localhost/work', poolsize:20});
//var db = require('work-pg')({dburl:'pg://fp@/var/run/postgresql/.s.PGSQL.5432/work', poolsize:20});
module.exports.db = db;

/*
var cr = require('./core/cr/crm').crmgr(__dirname+'/CR', 'A');
module.exports.cr = cr;
module.exports.UPLOADDIR = cr.entrance;

var smtp = require('./core/smtp').smtp("Gmail","******@gmail.com","*******");
module.exports.smtp = smtp;
*/
