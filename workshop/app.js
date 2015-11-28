
var conf = {};

conf.name = "Demo";

conf.port = 3000;

conf.rootdir = process.cwd();

conf.servermode = "DEVELOPMENT";
//conf.servermode = "PRODUCTION";

conf.verbs = ["get", "post"];
// "get", "post", "put", "head", "delete", "options",
// "trace", "copy", "lock", "mkcol", "move", "propfind", "proppatch", 
// "unlock", "report", "mkactivity", "checkout", "merge", "m-search",
// "notify", "subscribe", "unsubscribe", "patch", "search"

conf.log_access = conf.rootdir + "/LOG/access";
conf.log_debug = conf.rootdir + "/LOG/debug";
conf.log_message = conf.rootdir + "/LOG/debug";

conf.db_url = "pg://fp@localhost/work";
conf.db_poolsize = 20;

conf.uploaddir = conf.rootdir + "/TMP";

conf.session_secrets = ["Top Secret"];

//update session in DB
conf.session_update = 60;

//assume unused session to be stale
conf.session_decline = 2 * 24 * 60 * 60;

//delete stale sessions from DB
conf.session_sweep = 120;

//bcrypt hash cost (salt / rounds) - see https://github.com/ncb000gt/node.bcrypt.js
conf.auth_salt = 10;

//size of the random string sent during registration process
conf.auth_randomUrlSize = 50;

//how long to wait after an activation code is sent before one is sent again [seconds]
conf.auth_confirmationEmailDelay = 120;

//how long the registration url sent via email remains valid [seconds]
conf.auth_confirmationTimeout = 1200;

//Sender address in mails sent from this server
conf.smtp_from = "workJS@workJS.do.main"

require('workjs').run(conf);
