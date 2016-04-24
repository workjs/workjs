//work.js api-doc function

//bootrstrap the api-doc module
w.api_doc = {};
w.api_doc.mdocs = {};
w.api_doc.fdocs = {};

w.api_doc.mdocs.api_doc = 
`api_doc module manages the api documentation of modules and api-functions.
Use javascript multiline strings!
The "w.module" function also creates the module given by its name as property 
of the global "w" object.`;

w.module = function module_doc(name, docstring) {
  w[name] = {};
  w.api_doc.mdocs[name] = docstring;
};

const matchfnhead = /function\s*(\S*)\s*(\(\s*[^)]*?\s*\))/;

Function.prototype.doc = function doc(docstring){
  const src = this.toString();
  const m = matchfnhead.exec(src);
  const m_name = this.name || m[1];
  const params = m[2];
//  w.api_doc.fdocs[this] = [this.name, params, docstring, src];
  w.api_doc.fdocs[this] 
  = {name:m_name, params:params, src:src, doc:docstring, module:null, context:[]};
  return(this);
};

function api_doc_and_context(fn, mod, ctx) {
  if (typeof fn === "function") {
    if (w.api_doc.fdocs[fn]) {
      w.api_doc.fdocs[fn].context.push(ctx);
      w.api_doc.fdocs[fn].module = mod;
    } else {
      var src = fn.toString();
      var m = matchfnhead.exec(src);
      var m_name = fn.name || m[1];
      var params = m[2];
      w.api_doc.fdocs[fn]
      = {name:m_name, params:params, src:src, doc:"not documented", module:mod, context:[ctx]};
    };
  };
};

w.api_doc.init = function init() { 
  for (var p1 in w) {
    api_doc_and_context(w[p1], p1, p1);
    Object.keys(w[p1]).forEach( (p2, i2) => api_doc_and_context(w[p1][p2], p1, p1+"."+p2) );
  };
}.doc(`Initialize api-doc table.
WorkJS core/bootstrap calls this when all functions are loaded.`);

