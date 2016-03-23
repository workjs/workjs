# WorkJS Basics

The WorkJS framework provides a set of conventions, core functionality, middleware functions and some mountable components.

A WorkJS application is a Node.js package with workjs in its dependencies.
If "workjs" is required in the package start script, it will load the configuration of the application from a file "CONF" 
in the package root and create http request handlers for the routes definde in a route map file "MAP".

On load WorkJS attaches a global work context object as "w" to node global which can be used in the WorkJS application code 
to access the WorkJS core functionality.

WorkJS contains a boilerplate demo application "workshop" which can be cloned for a quick start.
~~~
workjs -c myApp
~~~

## WorkJS Package Structure

In the WorkJS package you find the following elements:

The core functionality and the middleware modules are implemented in the
"core" folder.

The file CONF contains the default configurations which can be overwritten in an application configuration.

All url routes served from the WorkJS core are defined in the file "MAP". 
If defines "/static" as url prefix for static ressources which are served without authorization.
At "/doc" is a docserver mounted and provides this documentation.
At "/ds" is the developer support module mounted which provides a toolset to help the developer 
in development and debugging an application.

Mountable modules - your own and the WorkJS core modules provide their own
route map. This route maps can be "mounted" at url paths (routes) specified in a MAP
file. Available WorkJS core modules are work-ds (developer support
functions), docserver (markdown documemtation server), work-store (file
store - under construction) and work-user (user management - under construction).

Each route definition in the MAP can also specify some middleware functionality to be
used with this route. Available middleware are functions for logging,
postgresql database access, session support, authentication, form parsing and WebSocket support.
