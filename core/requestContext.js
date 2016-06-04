//this is the request context prototype
//shared by each request.

const DEVELOPMENT = (w.conf.servermode == "DEVELOPMENT");

var requestProto = Object.create(w);

//finalize request, reply my body
requestProto.end = function end() {
  if (!this.res.headersSent) {
    console.log("FFFF");
    if (this.error) {
      var e = this.error;
      w.log("ERROR " + e.status + " " + e.message + "\n\n" + e.stack);
      var status = e.status || 500;
      var contenttype = e.contenttype || "text/plain";
      this.res.writeHead(status, {"Content-Type": contenttype});
      
      switch (status) {
        case "404": this.res.write("404 Not Found\n"); break;
        case "401": this.res.write("401 Unauthorized\n"); console.log("444"); break;
        case "500":
        default:  this.res.write("500 Internal Server Error\n"); console.log("DDD");
      };
      
      if (DEVELOPMENT) {
        this.res.write(e.message);
        this.res.write("\n\n"+e.stack);
      };
    } else {
      this.res.setHeader("Content-Type", "text/html; charset=utf-8");
      if (!this.body) this.body="";
      this.res.setHeader("Content-Length", Buffer.byteLength(this.body));
      this.res.write(this.body);
    };
    this.res.end();
  };
}.doc(`reply body, finalize request`);
  
requestProto.replyJSON = function replyJSON(obj) {
    this.res.setHeader("Content-Type", "application/json");
    this.res.end(w.dep.json_stringify_safe(obj));
}.doc(`reply obj as JSON data, finalize request`);

requestProto.reply3xx = function reply3xx(code, path) {
    this.res.writeHead(code, {"Location": path});
    this.res.end();
}.doc(`reply a "3xx" redirect response to "location"`);

requestProto.reply4xx = function reply4xx(code, message) {
    this.res.writeHead(code, {"Content-Type": "text/plain"});
    switch (code) {
      case "400": this.res.write("400 Bad Request\n"); break;
      case "401": this.res.write("401 Unauthorized\n"); break;
      case "402": this.res.write("402 Payment Required\n"); break;
      case "403": this.res.write("403 Forbidden\n"); break;
      case "404": this.res.write("404 Not Found\n"); break;
      case "405": this.res.write("405 Method Not Allowed\n"); break;
      case "406": this.res.write("406 Not Acceptable\n"); break;
      case "407": this.res.write("407 Proxy Authentication Required\n"); break;
      case "408": this.res.write("408 Request Timeout\n"); break;
      case "409": this.res.write("409 Conflict\n"); break;
      case "410": this.res.write("410 Gone\n"); break;
      case "411": this.res.write("411 Length Required\n"); break;
      case "412": this.res.write("412 Precondition Failed\n"); break;
      case "413": this.res.write("413 Payload Too Large\n"); break;
      case "414": this.res.write("414 URI Too Long\n"); break;
      case "415": this.res.write("415 Unsupported Media Type\n"); break;
      case "416": this.res.write("416 Requested Range Not Satisfiable\n"); break;
      case "417": this.res.write("417 Expectation Failed\n"); break;
      case "418": this.res.write("418 I'm a teapot\n"); break;
      case "421": this.res.write("421 Misdirected Request\n"); break;
      case "426": this.res.write("426 Upgrade Required\n"); break;
      case "427": this.res.write("428 Precondition Required\n"); break;
      case "428": this.res.write("429 Too Many Requests\n"); break;
      case "431": this.res.write("431 Request Header Fields Too Large\n"); break;
      default: this.res.write("400 Bad Request\n");
    };
    this.res.end();
}.doc(`generate a "4xx" client error response
https://developer.mozilla.org/en-US/docs/Web/HTTP/Response_codes`);

requestProto.reply5xx = function reply5xx(code, message) {
    this.error = new Error(message);
    this.error.status = code;
}.doc(`generate a "5xx" server error response
to be sent by the request processor`);

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

requestProto.set_cookie = w.cookie.set;
requestProto.get_cookie = w.cookie.get;
requestProto.get_signed_cookie = w.cookie.get_signed;

w.requestProto = requestProto;

w.newRequestContext = function newRequestContext(req, res) {
  var context = Object.create(requestProto);
  context.req = req;
  context.req.remoteAddress = req.connection.remoteAddress;
  context.res = res;
  context.id = w.unique();
  return context
};
