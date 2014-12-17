# WorkJS Core

* WorkJS core functionality
* based on [koa](https://github.com/koajs/koa)
* boilerplate code to create http and websocket server
* defines the middleware set to be used in the application maps
* default configuration
* routes to static files in modules
* master layout

An application simply requires `workjs` and 
WorkJS creates a http and a websocket server for your application.

Look into [work-base](https://github.com/workjs/work-base) for an example and tests.

WorkJS adds static routes for all application packages 
and loads a default middleware set which can be used in all routes.

WorkJS adds the "work" data object to the global module object 
and alters module.require to enable hot reloads.
You can use the original require as module.require_orig.

# Installation
```
$ npm install workjs
```
# Use

## Application

```
var work = require("workjs");
```

# API

## configuration

Configuration gets fetched from a file `configuration` in the package root 
of the application package.

# License
MIT
