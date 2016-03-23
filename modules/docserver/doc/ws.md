# WorkJS WebSockets

WebSockets have been the original reason to develope WorkJS :-)
The WorkJS implementation is based on [einaros/ws](https://github.com/websockets/ws).
We do not care about old browsers or old protocolls.

WorkJS supplies an API to manage communication and cares on reconnects.

A WorkJS application is supposed to consist of multiple single page applications.
Use WebSockets to communicate data between client(browser) und server

All data is transmitted JSON encoded. Only what can be encoded will find its way to the other side.

mw: 
set flag ws to "t"T

~~~
/*	get	chat {"ws":"t"}
~~~

This will load the ws API "ws.js" into the client.

## client side API

var ws = new worksocket({onopen:fn})
creates and opens ws connection to the server
the connection automatically reconnects

An optional onopen function is called EVERY TIME the worksocket connection is established.

ws.sendJSON(json)
send a JSON Object to the server

ws.rpc(name, param, [cb(r)])
Call server side function "name" with parameter "param".
Optional callback "cb" will be called with result "r".

name: Function name to be called on server side

param: Object given as parameter.

cb: Optional function. If given this function is called with the result from the remote procedure.

ws.on("name", fn(param))
Register function "name" to be called from server.

## server side API

The server side function must be defined in the websocket controller file ".ws" (chat.ws in our example).

The API functions are called in a webcocket context which contains:
this.ws - the original ws object
this.context - contains parameter from the url path
this.sess - session information if a session cookie is present, {data:{user_id:0}} if none.

function init()
called EVERY TIME a client opens the page and the websocket connection is established.
Return a websocket group key to accept the connection or a falsy value to deny.
The websocket group is the set of websocket clients which should get the events sent via "emit".
The websocket group key is used as object key for a cache object containing the groups assignment.

function name(parameter)
called if a client calls "rpc("name", parameter [cb])

this.emit("name", parameter);
Call client function "name" with parameter in ALL clients.
