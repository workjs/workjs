//this is the Work prototype
//the request_processor instantiantes a work object in every request
var send = require('send');
var body_parser = require('./body_parser.js');

module.exports = Work;

function Work(req, res) {
  this.req = req;
  this.req.remoteAddress = this.req.connection.remoteAddress;
  this.res = res;
  this.id = Date.now();
};

module.work.proto = Work.prototype;

Work.prototype.work = module.work;
var DEVELOPMENT = Work.prototype.DEVELOPMENT 
  = (module.work.conf.servermode == "DEVELOPMENT");

Work.prototype.error = null;

Work.prototype.unique = module.work.unique;

Work.prototype.sleep = module.work.sleep;

//finalize request, reply my body
Work.prototype.end = function end() {
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

Work.prototype.conf = module.work.conf;

Work.prototype.log = function() {
  module.work.logger.message.apply(this, arguments);
};

Work.prototype.debug = function(s) {
  // noop fallback if no debug flag
};

Work.prototype.replyJSON = function replyJSON(obj) {
  this.res.setHeader("Content-Type", "application/json");
  this.res.end(JSON.stringify(obj));
};

Work.prototype.reply303 = function reply303(path) {
  this.res.writeHead(303, {"Location": path});
  this.res.end();
};

Work.prototype.reply404 = function reply404(message) {
  this.error = new Error(message);
  this.error.status = 404;
};

Work.prototype.reply500 = function reply500(message) {
  this.error = new Error(message);
  this.error.status = 500;
};

Work.prototype.replyError = function replyError(err) {
  console.log("err:", err);
  console.log("stack:", err.stack);
  throw(err);
};

Work.prototype.sendFile = function sendFile(root, path, done) {
  var sf = send(this.req, path, {root:root, dotfiles:'deny', index:false})
  .on('end', done)
  .on('error', done)
  .pipe(this.res);
};

Work.prototype.sendFileSync = function sendFileSync(root, path) {
  console.log("core/prototype.js Work.prototype.sendFileSync");
  this.sendFile.sync(this, root, path);
};

var marked = require('marked');
var hljs = require('highlight.js');

marked.setOptions({
  highlight: function (code, lang) {
    if (lang) {
      return hljs.highlightAuto(code, [lang]).value;
    } else {
      return hljs.highlightAuto(code).value;
    }
  },
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
});

Work.prototype.marked = function markdown(md) {
  return marked(md);
};

Work.prototype.randomStringAsBase64Url = module.work.randomStringAsBase64Url;

//CR
Work.prototype.cr_add_file = function cr_add(file, folder, thumb) {
  var stock_id = module.work.cr.stock(file);
  
  return this.tx.only("insert into work_repo (name, mimeType, stock_id, folder, thumb) " +
    "VALUES (:name, :mime, :stock_id, :folder, :thumb) " +
    "RETURNING item_id;",
    {name:file.filename, mime:file.mimetype, stock_id:stock_id, folder:folder, thumb:thumb});
};

Work.prototype.cr_add_folder = function cr_add_folder(name, folder, thumb) {
  return this.tx.only("insert into work_repo (name, folder, thumb) " +
    "VALUES (:name, :folder, :thumb) RETURNING item_id;",
    {name:name, folder:folder, thumb:thumb});
};

Work.prototype.cr_send = function cr_send(item_id, disposition) {
  var item = this.tx.one("select s.location, r.name, r.mimetype " +
    "from work_storage s, work_repo r " +
    "where r.item_id=:item_id and r.stock_id = s.stock_id",
    {item_id:item_id});
  this.res.setHeader('Content-type', item.mimetype);
  this.res.setHeader('Content-disposition', disposition+'; filename=' + item.name);
  this.sendFileSync(module.work.cr.cr_root, item.location);
};

Work.prototype.cr_download = function cr_download(item_id) {
  this.cr_send(item_id, "attachment");
};

Work.prototype.cr_open = function cr_open(item_id) {
  this.cr_send(item_id, "inline");
};
