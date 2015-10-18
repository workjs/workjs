var w = module.work;

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

w.parseForm = function parseForm(next) {
  var that = this;
  var uploaddir = this.conf.uploaddir;
  var form = {};
  var busboy = new Busboy({ headers:this.req.headers, limits:limits });
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    var md5 = crypto.createHash('md5');
    md5.setEncoding('hex');
    var path = uploaddir + '/' + w.unique();
    file.on('error', that.replyError);

    var size = 0;
    file.on('data', function (chunk) { size += chunk.length; });
    md5.on('finish', function() {
      var f = { path:path, filename:filename, encoding:encoding, mimetype:mimetype, 
                size:size, md5:md5.read() };
      if (form.hasOwnProperty(fieldname)) { form[fieldname].push(f); }
      else { form[fieldname] = [f]; };
    });
    file.pipe(fs.createWriteStream(path));
    file.pipe(md5);
  });
  busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
    if (form.hasOwnProperty(fieldname)){ form[fieldname].push(val); }
    else { form[fieldname] = [val]; };
  });
  busboy.on('partsLimit', function() { that.reply500("parseForm partsLimit"); });
  busboy.on('filesLimit', function() { that.reply500("parseForm filesLimit"); });
  busboy.on('fieldsLimit', function() { that.reply500("parseForm fieldsLimit"); });
  busboy.on('error', that.replyError);
  busboy.on('finish', function() {
    for (var prop in form) { that.context[prop] = form[prop]; };
    next();
  }.wrap());
  this.req.pipe(busboy);
};
