//this is the request context prototype
//shared by each request.

var requestProto = Object.create(w);

//finalize request, reply my body
requestProto.end = function end() {
    this.res.setHeader("Content-Type", "text/html; charset=utf-8");
    if (!this.body) this.body="";
    this.res.setHeader("Content-Length", Buffer.byteLength(this.body));
    this.res.write(this.body);
    this.res.end();
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
    this.sendFile.sync(this, root, path);
};

requestProto.add_js = function add_js(target) {
    this.context._js.push(target);
};

requestProto.add_css = function add_css(target) {
    this.context._css.push(target);
};

w.newRequestContext = function newRequestContext(req, res) {
  var context = Object.create(requestProto);
  context.req = req;
  context.req.remoteAddress = req.connection.remoteAddress;
  context.res = res;
  context.id = w.unique();
  return context
};
