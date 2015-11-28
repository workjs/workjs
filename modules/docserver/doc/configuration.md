# WorkJS - Configuration

The start script of a workJS application contains the basic framework
configuration and finishes by starting WorkJS:

```javascript
// Example app.js

var conf = {};
conf.name = "Demo";
conf.port = 3000;  
conf.rootdir = process.cwd();

conf.servermode = "DEVELOPMENT";
//conf.servermode = "PRODUCTION";

conf.verbs = ["get", "post"];

conf.access_logdir = conf.rootdir + "/LOG/access";
conf.debug_logdir = conf.rootdir + "/LOG/debug";  
conf.message_logdir = conf.rootdir + "/LOG/debug";

conf.db_url = "pg://fp@localhost/work";
conf.db_poolsize = 20;

conf.uploaddir = conf.rootdir + "/TMP";

conf.session_secrets = ["Top Secret"];

conf.session_update = 60;
conf.session_decline = 2 * 24 * 60 * 60;
conf.session_sweep = 120;

require('workJS').run(conf);
```

* conf.name: give your application a name.

* conf.port: the port where the server listens

* conf.rootdir: the base directory of your application

* conf.servermode: should be "DEVELOPMENT" or "PRODUCTION".
In "DEVELOPMENT" mode changes will reload automatically.

* conf.verbs: the http methods used by the application ("GET", "POST", ..).

* conf.access_logdir: location containing the access log files.

* conf.debug_logdir: location containing the debug log files.

* conf.message_logdir: location containing log files for messages not related to a http request.

* conf.db_url: url to access the Postgres database.

* conf.db_poolsize: poolsize connections are opened to the database.
Requests are queued if the application requires more than db_poolsize connections.

* conf.uploaddir: location of files which have been uploaded.

* conf.session_secrets: secrets used to sign session cookies.

* conf.session_update: time in seconds after which the session access timestamp will
be updated in the database.

* conf.session_decline: time in seconds after which a session if not used
is assumed to be stale and dropped from databse and session cache.

* conf.session_sweep: time interval to run the sweeper function to clean stale session data
from session cache and database.

* require('workJS').run(conf): use the configuration, start everything and
begin to process http requests.

