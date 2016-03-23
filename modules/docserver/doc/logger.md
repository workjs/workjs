# WorkJS - Logger

WorkJS provides functionality to log requests, debug information and measure execution time.

Some of the logging functionality is controlled with module flags.

### Module Flags: access, debug

If the "access" flag for a route is true, 
a line is written into an access log file for each reply sent.
The access log file is placed in the location configured and it's name contains the current date.

If the "debug" flag for a route is true,
debug lines are written into a debug log file.
The debug log file is placed in the location configured and it's name contains the current date.
If debug lines are written, a line is written when the request arrives, 
a line is written when the reply is sent and additional lines are written 
when this.debug is called. All debug lines contain an unique request ID 
and the time relative to the start of the request.

Example
~~~nohighlight
2015-10-11/15:42:14 1444570934667 *** [0ms] GET /doc/logger.md
2015-10-11/15:42:14 1444570934667 === [6ms] 'md generated'
2015-10-11/15:42:14 1444570934667 +++ [9ms] 200 "text/html; charset=utf-8" (2067)
~~~

* 1444570934667 = unique request ID
* `***` = request start
* `===` = additional debug message
* `+++` = request end
* `[6ms]` = time used since start of the request
* `200` = reply code
* `2067` = reply size

### Configuration Options:

**Access Log:** `conf.access_logdir = conf.rootdir + "/LOG/access";`
<br>The folder containing access log files.

**Debug Log:** `conf.debug_logdir = conf.rootdir + "/LOG/debug";`
<br>The folder containing debug log files.

**Message Log:** `conf.message_logdir = conf.rootdir + "/LOG/debug";`
<br>The folder containing log files for messages not related to a http request.

## Properties

### this.debug([data][, ...])
Log an additional debug log line for each parameter "data".
No debug line is written if a debug flag is set to "f".

### this.log([data][, ...])
### w.log([data][, ...])
For each parameter "data" log a line into the message log file.
<br>Use w.log if you want to log from a location which is 
not in a request handler - e.g. in module initialisation.
