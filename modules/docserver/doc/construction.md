# WorkJS Construction

The WorkJS framework provides a set of conventions, some core functionality, some
middleware modules and some mountable core modules.

The core functionality and the middleware modules are implemented in the
"core" folder. A WorkJS application defines all served url routes in a file named "MAP".
This is the route map of the application.

Mountable modules - your own and the WorkJS core modules provide their own
route map. This route maps can be "mounted" at url paths (routes) specified in a MAP
file. Available WorkJS core modules are work-ds (developer support
functions), docserver (markdown documemtation server), work-store (file
store - under construction) and work-user (user management - under construction).

Each route definition also can specify some middleware functionality to be
used with this route. Available middleware provides functions for logging,
postgresql database access, session support, authentication and form
parsing.