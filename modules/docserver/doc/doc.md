# WorkJS Modules API Documentation

## Properties

### w.module(module_name, documentation_string)

Call w.module to add a module documentation. Use javascript multiline strings.

~~~
w.module("pg", `Postgresql database interface, based on pg-native`);
~~~

### Function.doc(documentation_string)

Add documentation to functions:

~~~
requestProto.replyJSON = function replyJSON(obj) {
...
}.doc(`reply obj as JSON data, finalize request`);
~~~

The API documentation of all WorkJS modules is collected during server start and 
is browseable in the Developer Support.
