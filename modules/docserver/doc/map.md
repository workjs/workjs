# WorkJS - The MAP

The route map is a file with name "MAP" in the root directory of the application
package. It defines the mapping from urlpath and http method of a http
request to the javascript function and/or the screen template to render 
the resulting web page.

The MAP files is composed as follows:

* empty lines and lines which contain only white space are ignored
* lines starting with a '#' are comments and ignored
* all other lines must contain white space separate *urlpath*, *method*, *target*
and optional *module flags*. This lines define routes.

Example:
~~~nohighlight
#Example routes:

/home get www/home
/login post auth/login
~~~
   
The "/home" line defines that if a browser is directed to "http://your.ser.ver/home"
and sends a http "GET" request, then WorkJS will look for a javascript
function "get" located in a file "www/home.js" and a nunjucks html template in a file
"www/home.get" to render the reply page. You can use the "get" funktion or
the ".get" template or both together.

The "/login" line defines that a "POST" request sent to "http://your.ser.ver/login"
triggers a function "post" located in a file "auth/login.js" and/or uses a html template
in a file "www/home.post" to render a reply page.

## Urlpath
The urlpath is a string which starts with "/", "=" or "@".

**A standard urlpath** starts with "/" and contains one or more segments separated by "/".
Each segment may also be empty.

Each segment may start with a colon - in this case the string of the segment defines 
the name of an url variable. If a matching url is processed the contents of
url segments which correspond to url variables are put with the variable name
in "this.context" object.

Only the last segment can be defined as wildcard segment with an "*" character.
If a matching url is processed the contents of the part of the url starting at the 
wildcard segment is put into "this.context._location".

**An absolute urlpath** starts with "=/" and denotes an absolute url.
No "mountpoints" are prependet to an absolute urlpath (see "Target" below).

**A null urlpath** is defined with a single "@" character.
It specifies the empty string and can be used to mount modules into the root of the current module.

## HTTP Method

The http method ("verb") can be any of the verbs given in the configuration or "*".
"*" defines the route for all configured verbs.

## Target

If the target of a route starts with a colon, it specifies a npm package mounted 
at the given urlpath and method.
Otherwise the target specifies the path to files containing handler function 
or a html template.

Examples:
~~~nohighlight
/mountpoint  *     :my-subsite
/hello      get    www/hello
~~~

The route with urlpath "/mountpoint" defines the all requests to a urlpath starting 
with "/mountpoint" will be looked up in the MAP file of a npm package "my-subsite".
WorkJS uses [resolve](https://www.npmjs.com/package/resolve) 
which implements the node require.resolve() algorithm
to find the given package.
Routes are formed by prepending "/mountpoint" to all urlpaths found in the MAP file 
of package "my-subsite".

The route with urlpath "/hello" defines that GET requests to a urlpath "/hello"
will be handled by a javascript function "get" in a file "www/hello.js" if 
such a file and function exists.
It also defines that a nunjucks template /hello.get if it exists is used 
to render a reply.

You can use a handler function or a nunjucks template or both together.

To implement a javascript handler function:

* export a function named after the http method (verb) you want to server (e.g. "get")
* use "this.context" object to set values to be output in a template
* a call to next() is required to render a template

Example handler function:
~~~javascript
// www/hello.js
module.exports.get = function home(next) {
  this.context.title = 'Hello World Title';
  next();
};
~~~

Example nunjucks template www/hello.get
~~~html
<h1>{{title}}</h1>
~~~


## Module Flags

WorkJS defines some module flags (dbCommit, dbRollback, session, logAccess, logDetail, formData).
Each of these flags can be set to true or false with the characters "t" and "f".

Default values for all module flags can be defined in the WorkJS configuration option "defaultflags".

In the MAP file optional module flags can be  defined as JSON string which must 
stay in the route line (no line breaks).
Flags can be defined for all methods or separate for each method.

Flag specifications in a route line override defaults from configuration or from a parent module.

Example:
~~~nohighlight
/static/*       get     www/fileserver {"logAccess":"f", "session":"f"}
/xxx             *      www/xxx  {"logAccess": {"get": "f", "post": "t"}}
~~~

## Subsite Modules

If a subsite module is defined in a route map, the urlpath of the parent MAP file
is prependet to all routes in the subsite MAP. The subsite module is "mounted" 
at the given urlpath.

Module flags specified for a subsite route are the defaults for all routes in 
the mounted subsite module.
