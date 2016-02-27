//this is the WorkJS context prototype

const w = module.work;

//this is the prototype shared by all contexts
w.proto.conf = w.conf;

w.proto.cache = w.cache;

w.proto.dep = w.dep;
w.proto.DEVELOPMENT = (w.conf.servermode == "DEVELOPMENT");

w.proto.id = "---"; //used in logging

w.proto.rootdir = w.rootdir;

w.proto.work = w;

//    this.runid = this.unique();

//    this.error = null;

/*    this.logger = require("./logger.js")({
      alogdir:this.conf.log_access,
      dlogdir:this.conf.log_debug,
      mlogdir:this.conf.log_message
    });
    
    this.log = this.logger.message;
    this.debug = null; //will be overwritten if debug flag used
*/    
w.proto.marked = function marked(md) {
      return w.dep.marked(md)
};
    
//http://stackoverflow.com/questions/8855687/secure-random-token-in-node-js/25690754#25690754
//size is the unencoded size, therefore the returned string will be longer
w.proto.randomStringAsBase64Url = function randomStringAsBase64Url(size) {
      return w.dep.base64url(w.dep.crypto.randomBytes(size));
};
    
w.proto.sleep = function sleep(ms) {
      w.dep.syncho.sleep(ms);
};

var unique = 0;
w.proto.unique = function unique() {
      var u = Date.now();
      while (u <= unique) u++;
      unique = u;
      return u;
};

// request prototype

var requestProto = Object.create(w.proto);

//finalize request, reply my body
requestProto.end = function end() {
//  if (!res.headersSent) {
//    if (typeof this.body !== 'undefined') {
        this.res.setHeader("Content-Type", "text/html; charset=utf-8");
        if (!this.body) this.body="";
        this.res.setHeader("Content-Length", Buffer.byteLength(this.body));
        this.res.write(this.body);
        this.res.end();
//    };
//  };
};
  
requestProto.replyJSON = function replyJSON(obj) {
    this.res.setHeader("Content-Type", "application/json");
    this.res.end(JSON.stringify(obj));
};

requestProto.reply3xx = function reply3xx(code, path) {
    this.res.writeHead(code, {"Location": path});
    this.res.end();
};

requestProto.reply4xx = function reply4xx(code, message) {
    this.error = new Error(message);
    this.error.status = code;
};

requestProto.reply5xx = function reply5xx(code, message) {
    this.error = new Error(message);
    this.error.status = code;
};

requestProto.throwError = function throwError(err) {
    console.log("err:", err);
    console.log("stack:", err.stack);
    throw(err);
};

requestProto.sendFile = function sendFile(root, path, done) {
    var sf = w.dep.send(this.req, path, {root:root, dotfiles:'deny', index:false})
    .on('end', done)
    .on('error', done)
    .pipe(this.res);
};

requestProto.sendFileSync = function sendFileSync(root, path) {
    console.log("core/prototype.js Work.prototype.sendFileSync");
    this.sendFile.sync(this, root, path);
};

requestProto.add_js = function add_js(target) {
    this.context._js.push(target);
};

requestProto.add_css = function add_css(target) {
    this.context._css.push(target);
};

w.proto.newRequestContext = function newRequestContext(req, res) {
  var context = Object.create(requestProto);
  context.req = req;
  context.req.remoteAddress = req.connection.remoteAddress;
  context.res = res;
  context.id = w.unique();
  return context
};

// WebSocket prototype

var wsProto = Object.create(w.proto);

wsProto.sendJSON = function(o){
  console.log("wsProto.sendJSON");
  if (this.ws.readyState === 1) this.ws.send(JSON.stringify(o));
};

wsProto.emit = function emit(event, params) {
  console.log("wsProto.emit", event, params);
  const members = w.ws_nodes[this.n.id][this.group_id];
  console.log("wsProto.emit this.n.id", this.n.id, "this.group", this.group_id);
//  console.log("wsProto.emit to:", members);
  for (o in members) members[o].sendJSON([event, params]);
};

w.proto.newWSContext = function newWSContext(ws) {
  var context = Object.create(wsProto);
  context.ws = ws;
  context.id = w.unique();
  context.n = null;
  context.group = null;
  context.sess = null;
  return context
};
