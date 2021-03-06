w.body_parser = {};

var Busboy = require('busboy');
var fs = require('fs');
var crypto = require('crypto');

var Sync = require('syncho');

var limits = {  
    fieldNameSize: 100,  
    fieldSize: 1024*1024,
    fields: Infinity,  
    fileSize: Infinity,
    files: Infinity, 
    parts: Infinity, 
    headerPairs: 2000
};

function parseFormAsync(done) {
  var that = this;
  var uploaddir = this.conf.uploaddir;
  var form = {};
  var busboy = new Busboy({ headers:this.req.headers, limits:limits });
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    var md5 = crypto.createHash('md5');
    md5.setEncoding('hex');
    var file_id = w.unique();
    var path = uploaddir + '/' + file_id;
    file.on('error', that.throwError);

    var size = 0;
    file.on('data', function (chunk) { size += chunk.length; });
    md5.on('finish', function() {
      var f = { file_id:file_id, path:path, filename:filename, encoding:encoding,
                mimetype:mimetype, size:size, md5:md5.read() };
      if (form.hasOwnProperty(fieldname)) { 
        if (form[fieldname] instanceof Array) { form[fieldname].push(f); }
        else form[fieldname] = [form[fieldname], f]; }
      else if (fieldname.slice(-1) === '*') { form[fieldname] = [f]; }
           else { form[fieldname] = f; };
    });
    file.pipe(fs.createWriteStream(path));
    file.pipe(md5);
  });
  busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
    if (form.hasOwnProperty(fieldname)) {
      if (form[fieldname] instanceof Array) { form[fieldname].push(val); }
      else form[fieldname] = [form[fieldname], val]; }
    else if (fieldname.slice(-1) === '*') { form[fieldname] = [val]; }
        else { form[fieldname] = val; };
  });
  busboy.on('partsLimit', function() { that.reply5xx(500, "parseForm partsLimit"); });
  busboy.on('filesLimit', function() { that.reply5xx(500, "parseForm filesLimit"); });
  busboy.on('fieldsLimit', function() { that.reply5xx(500, "parseForm fieldsLimit"); });
  busboy.on('error', that.throwError);
  busboy.on('finish', function() {
    for (var prop in form) { that.context[prop] = form[prop]; };
    done();
  });
  this.req.pipe(busboy);
};

w.mw.body_parser = function parseForm(next) {
  parseFormAsync.sync(this);
  next();
};
