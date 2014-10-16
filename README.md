# WorkJS Core

* WorkJS core functionality
* based on [koa](https://github.com/koajs/koa)
* boilerplate code to create http and websocket server
* defines the middleware set to be used in the application map
* default configuration
* routes to static files in modules
* master layout

WorkJS modules - npm packages and modules mounted via the map - can be registered.  
The WorkJS Core provides services for registered modules.

An application is registered with the key "main". 
WorkJS creates a http and a websocket server for the allication.

WorkJS adds static routes for all registered modules and provides a function 
to add scripts located in the static folder of a registered module.

# Installation
```
$ npm install workjs
```
# Use

## Application

```
var work = require("workjs").register("main", {dirname: __dirname});
```

## Module

```
var work = require("workjs").register("my_key", {dirname: __dirname});
```

# API

## register(key, options)
* _key_ module (package) key
* _options_ options Object
  * _dirname_ String Root directory of the module
  * _media_prefix_ String Url prefix for static routes without leading '/'
* __return:__ Work object

_key_ must be unique for every registered module.
We can use the package name if the module is a npm package.
The main module uses 'main' as key.

## modules
* Object containing all registered modules

## conf
* Object containig configurations
  * _media_prefix_ Configured prefix for static routes

## Work.media_url(target)
* _target_ String Target resource within local `static` folder
* __return:__ Resource url

## Work.add_js(mod, target)
* _mod_ Module context ("this")

Add a js script reference to this page.  
The media url to target in this module is appended to locals.__js 
which should be rendered with layouts/master.html.

# License
MIT
