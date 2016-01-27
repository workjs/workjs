# WorkJS - Configuration CONF

The file CONF in a workJS application contains the basic framework configuration. 
This configurations overrules the default configuration from the workjs package.

module.work.rootdir can be used to find the base directory of an application and 
module.work.coredir is the base directory of the workjs package.

Look into the default configuration (CONF in the workjs package) for the configurable options:

* w.conf.name: give your application a name.

* w.conf.port: the port where the server listens

* w.conf.origin: origin of this site as seen from outside (used to check websocket origin)

* w.conf.servermode: should be "DEVELOPMENT" or "PRODUCTION".
In "DEVELOPMENT" mode changes will reload automatically.

* w.conf.verbs: the http methods used by the application ("GET", "POST", ..).

* w.conf.flags: Default flags to use.
* w.conf.flags.get
* w.conf.flags.post
* w.conf.flags.default

* w.conf.log_access: directory containing the access log files.
* w.conf.log_debug: directory containing the debug log files.
* w.conf.log_message: directory containing log files for messages not related to a http request.

* w.conf.db_url: url to access the Postgres database.

* w.conf.db_poolsize: poolsize connections are opened to the database.
Requests are queued if the application requires more than db_poolsize connections.

* w.conf.staticdir: location of static resources

* w.conf.uploaddir: location of files which have been uploaded.

* w.conf.session_secrets: secrets used to sign session cookies.

* w.conf.session_update: time in seconds after which the session access timestamp will
be updated in the database.

* w.conf.session_decline: time in seconds after which a session if not used
is assumed to be stale and dropped from databse and session cache.

* w.conf.session_sweep: time interval to run the sweeper function to clean stale session data
from session cache and database.

* w.conf.cookiename: the name of the session cookie

* w.conf.auth_salt
bcrypt hash cost (salt / rounds) - see https://github.com/ncb000gt/node.bcrypt.js

* w.conf.auth_randomUrlSize
size of the random string sent during registration process

* w.conf.auth_confirmationEmailDelay:
how long to wait after an activation code is sent before one is sent again [seconds]

* w.conf.auth_confirmationTimeout:
how long the registration url sent via email remains valid [seconds]

* w.conf.smtp_from: Sender address in mails sent from this server

* w.conf.cr_root: the content repository location in file system

* w.conf.cr_partition: current place to store inside of cr_root
