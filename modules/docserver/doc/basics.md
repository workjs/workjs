# WorkJS Basics

## "this"

WorkJS provides functionality with the request context.

Use it with "this" in your request handler.

Examples:
~~~javascript
this.log("hi xxx");   
this.context.title = 'Hello World';
this.db.one("SELECT * FROM sometable");
this.reply404("error ....");
~~~

## module.work

For functionality to be used if not in a request context
WorkJS also provides a "Work" data structure appended to the module structure.

It can be accessed from everywhere via "module.work".

~~~
var conf = module.work.conf.servermode;
~~~

## Request Parameter

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

