# WorkJS Context

To create a new application, you must write a map file and implement request handler functions and templates.
The WorkJS API is attached to the global module.work and to the "this" context of the handler functions.

## module.work

The global "work" object carries all API functionality which is NOT tied to a request context.
It can be accessed from everywhere via "module.work".

Example:
~~~
var conf = module.work.conf.servermode;
~~~

## "this"

Functionalty tied to a http request is available in a handler function via the "this" object.

Examples:
~~~javascript
this.log("hi xxx");   
this.context.title = 'Hello World';
this.db.one("SELECT * FROM sometable");
this.reply4xx(404, "error ....");
~~~

## this.context

In a request context "this.context" is used to fetch query parameters and deliver values to the templating system.

### url parameters in the query string

Query string parameters are automatically placed into this.context.

Example:
~~~
/base/url?x=a&x=8&y=2
~~~

this will result in this.context = {x:['a', '8'], y:'2'}

Parameters given multiple times or which have a name ending with '*' 
are returned as arrays.

### form fields x-www-form-urlencoded or multipart/form-data

Form fields are fetched if the flag "formData" for a route is set true.
As with query string parameters, form fields are put into this.context
and returned as arrays if present multiple times or if the name ends with '*'.

### url segments

If a matching route contains route variables,
segments which match a variable are put into this.context.
Url parts which match a wildcard segments are put into "this.context._location".

Example:
~~~nohighlight
/user/:user_id/put/:key  *  www/user/put
~~~

URL: /user/1735/put/12a

This will result in this.context = {user_id:'1735', key:'12a'}

### caches

Local caches can be put into w.cache and are also available at this.cache.
