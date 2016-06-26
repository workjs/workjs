//this is the request context prototype
//shared by each request.

const DEVELOPMENT = (w.conf.servermode == "DEVELOPMENT");

var requestProto = Object.create(w);

//finalize request, reply my body
requestProto.end = function end() {
  if (!this.res.headersSent) {
    if (this.error) {
      var e = this.error;
      w.log("ERROR " + e.status + " " + e.message + "\n\n" + e.stack);
      var status = e.status || 500;
      var contenttype = e.contenttype || "text/plain";
      this.res.writeHead(status, {"Content-Type": contenttype});
      
      switch (status) {
        case 404: this.res.write("404 Not Found\n"); break;
        case 401: this.res.write("401 Unauthorized\n"); break;
        case 500:
        default:  this.res.write("500 Internal Server Error\n");
      };
      
      if (DEVELOPMENT) {
        this.res.write(e.message);
        this.res.write("\n\n"+e.stack);
      };
    } else {
      switch (this.res.statusCode) {
        case 0: if (!this.body) this.body="";
                this.res.writeHead(200, {
                 'Content-Type': 'text/html; charset=utf-8',
                 'Content-Length': Buffer.byteLength(this.body) });
                this.res.write(this.body);
                break;
        case 200: this.res.write(this.body); break;
        default:
      }
    };
  };
  this.res.end();
}.doc(`reply body, finalize request`);
  
requestProto.replyJSON = function replyJSON(obj) {
    this.body=w.dep.json_stringify_safe(obj);
    this.res.setHeader('Content-Type', 'application/json');
    this.res.setHeader('Content-Length', Buffer.byteLength(this.body));
    this.res.statusCode = 200;
}.doc(`reply obj as JSON data, finalize request`);

requestProto.reply3xx = function reply3xx(code, path) {
    this.res.setHeader('Location', path);
    this.res.statusCode = code;
}.doc(`reply a "3xx" redirect response to location "path"`);

requestProto.reply4xx = function reply4xx(code, message) {
  if (message) { this.res.statusMessage = message; }
  else {
    switch (code) {
      case "400": this.res.statusMessage = "400 Bad Request\n"; break;
      case "401": this.res.statusMessage = "401 Unauthorized\n"; break;
      case "402": this.res.statusMessage = "402 Payment Required\n"; break;
      case "403": this.res.statusMessage = "403 Forbidden\n"; break;
      case "404": this.res.statusMessage = "404 Not Found\n"; break;
      case "405": this.res.statusMessage = "405 Method Not Allowed\n"; break;
      case "406": this.res.statusMessage = "406 Not Acceptable\n"; break;
      case "407": this.res.statusMessage = "407 Proxy Authentication Required\n"; break;
      case "408": this.res.statusMessage = "408 Request Timeout\n"; break;
      case "409": this.res.statusMessage = "409 Conflict\n"; break;
      case "410": this.res.statusMessage = "410 Gone\n"; break;
      case "411": this.res.statusMessage = "411 Length Required\n"; break;
      case "412": this.res.statusMessage = "412 Precondition Failed\n"; break;
      case "413": this.res.statusMessage = "413 Payload Too Large\n"; break;
      case "414": this.res.statusMessage = "414 URI Too Long\n"; break;
      case "415": this.res.statusMessage = "415 Unsupported Media Type\n"; break;
      case "416": this.res.statusMessage = "416 Requested Range Not Satisfiable\n"; break;
      case "417": this.res.statusMessage = "417 Expectation Failed\n"; break;
      case "418": this.res.statusMessage = "418 I'm a teapot\n"; break;
      case "421": this.res.statusMessage = "421 Misdirected Request\n"; break;
      case "426": this.res.statusMessage = "426 Upgrade Required\n"; break;
      case "427": this.res.statusMessage = "428 Precondition Required\n"; break;
      case "428": this.res.statusMessage = "429 Too Many Requests\n"; break;
      case "431": this.res.statusMessage = "431 Request Header Fields Too Large\n"; break;
      default: this.res.statusMessage = "400 Bad Request\n";
    }
  }
  this.res.statusCode = code;
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

w.requestProto = requestProto;

w.newRequestContext = function newRequestContext(req, res) {
  var context = Object.create(requestProto);
  context.req = req;
  context.req.remoteAddress = req.connection.remoteAddress;
  context.res = res;
  context.id = w.unique();
  context.res.statusCode = 0;
  return context
};
