// WebSocket prototype

w.module("ws", `WebSocket management.`);

var wsProto = Object.create(w);

wsProto.sendJSON = function sendJSON(o){
  console.log("wsProto.sendJSON");
//  if (this.ws.readyState === 1) this.ws.send(JSON.stringify(o));
  if (this.ws.readyState === 1) this.ws.send(w.dep.json_stringify_safe(o));
};

wsProto.emit = function emit(event, params) {
  console.log("wsProto.emit", event, params);
  const members = w.ws_nodes[this.n.id][this.group_id];
  console.log("wsProto.emit this.n.id", this.n.id, "this.group", this.group_id);
//  console.log("wsProto.emit to:", members);
  for (o in members) members[o].sendJSON([event, params]);
}.doc("emit doc ...");

w.wsProto = wsProto;

w.ws.newWSContext = function newWSContext(ws) {
  var context = Object.create(wsProto);
  context.ws = ws;
  context.id = w.unique();
  context.n = null;
  context.group = null;
  context.sess = null;
  return context
}.doc(`Create the context for a websocket connection.
Used from the websocket server on connection establishing.`);
