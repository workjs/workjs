
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

conf.access_logdir = conf.rootdir + "/LOG/access";
conf.debug_logdir = conf.rootdir + "/LOG/debug";
conf.message_logdir = conf.rootdir + "/LOG/debug";

conf.db_url = "pg://fp@localhost/work";
conf.db_poolsize = 20;

conf.uploaddir = conf.rootdir + "/TMP";

conf.session_secrets = ["Top Secret"];

//assume session to be new
conf.session_fresh = 30;

//update session in DB
conf.session_update = 60;

//assume unused session to be stale
conf.session_decline = 2 * 24 * 60 * 60;

//delete stale sessions from DB
conf.session_sweep = 120;

require('workjs').run(conf);
