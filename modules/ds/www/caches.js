
module.exports.get = function caches(next) {
  
  var r = this.cache;

var theObjs = [];
var thePrs = [];
var i = 0;

theObjs.push(this.cache);
while (theObjs.length > thePrs.length) { thePrs[i] = render(theObjs[i], i); i++ };

this.context.r = thePrs;
this.context.r = w.dep.util.inspect(thePrs, {depth:10});

function render(obj, nr) {
  console.log("render .......", nr);
  if (obj === undefined) return '<span class="kw">undefined</span>';
  if (obj === null) return '<span class="kw">null</span>';
  if (obj instanceof Array) {
    var size = obj.length;
    if (!size) { return '<span class="val">[]</span>' };
    var r = '<div class="obj open" data-size="'+size+'" data-o="'+nr+'">[<br>';
    for (var i = 0; i < size; i++) {
      r += renderClosed(obj[i]);
      if (i+1 < size) r += ',<br>'
    };
    r += '<br>]</div>';
    return r;
  };
  if (obj instanceof Object) {
    var keys = Object.keys(obj);
    var size = keys.length;
    if (!size) { return '<span class="val">{}</span>' };
    var r = '<div class="obj open" data-size="'+size+'" data-o="'+nr+'">{<br>';
    for (var i = 0; i < size; i++) {
      var prop = keys[i];
      r += prop+': '+renderClosed(obj[prop]);
      if (i+1 < size) r += ',<br>'
    };
    r += '<br>}</div>';
    return r;
  };
  return '<span class="val">'+obj+'</span>';
};

function renderClosed(obj) {
  console.log("renderClosed .......");
  if (obj === undefined) return '<span class="kw">undefined</span>';    
  if (obj === null) return '<span class="kw">null</span>';    
  if (obj instanceof Array) {
    var size = obj.length;
    if (!size) { return '<span class="val">[]</span>' };
    var nr = theObjs.indexOf(obj);
    if (nr === -1) { nr = theObjs.length; theObjs.push(obj); }
    return '<div class="obj new" data-size="'+size+'" data-o="'+nr+'">..'+size+'..</div>';
  };
  if (obj instanceof Object) {
    var keys = Object.keys(obj);
    var size = keys.length;
    if (!size) { return '<span class="val">{}</span>' };
    var nr = theObjs.indexOf(obj);
    if (nr === -1) { nr = theObjs.length; theObjs.push(obj); }
    return '<div class="obj new" data-size="'+size+'" data-o="'+nr+'">..'+size+'..</div>';
  };
  if (typeof obj == 'object') return '<span class="kw">object</span>';
  return '<span class="val">'+obj+'</span>';
};

  next();
};


