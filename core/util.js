var util = require('util');

w.module("util", `Various helper functions.`);

w.util.inspect = function inspect(obj) {
  var theObjs = [];
  var thePrs = [];
  
  theObjs.push(obj);
  var i = 0;
  while (theObjs.length > thePrs.length) { thePrs[i] = render(theObjs[i], i); i++ };
  return util.inspect(thePrs);
  
  function render(obj, nr) {
    if (obj === undefined) return '<span class="kw">undefined</span>';
    if (obj === null) return '<span class="kw">null</span>';
    if (obj instanceof Array) {
      var size = obj.length;   
      if (!size) { return '<span class="val">[]</span>' };
      var r = '<div class="json obj open" data-size="'+size+'" data-o="'+nr+'">[<br>';
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
      var r = '<div class="json obj open" data-size="'+size+'" data-o="'+nr+'">{<br>';
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
    if (obj === undefined) return '<span class="kw">undefined</span>';    
    if (obj === null) return '<span class="kw">null</span>';    
    if (obj instanceof Array) {
      var size = obj.length;
      if (!size) { return '<span class="val">[]</span>' };
      var nr = theObjs.indexOf(obj);
      if (nr === -1) { nr = theObjs.length; theObjs.push(obj); }
      return '<div class="json obj new" data-size="'+size+'" data-o="'+nr+'">..'+size+'..</div>';
    };
    if (obj instanceof Object) {
      var keys = Object.keys(obj);
      var size = keys.length;
      if (!size) { return '<span class="val">{}</span>' };
      var nr = theObjs.indexOf(obj);
      if (nr === -1) { nr = theObjs.length; theObjs.push(obj); }
      return '<div class="json obj new" data-size="'+size+'" data-o="'+nr+'">..'+size+'..</div>';
    };
    if (typeof obj == 'object') return '<span class="kw">object</span>';
    return '<span class="val">'+obj+'</span>';
  };
  
};
/*.doc(`Work Object Inspector
Inspect object with the browser. Requires JQuery and work-util.css and work-util.js.`);
*/
