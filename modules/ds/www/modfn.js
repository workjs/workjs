
module.exports.get = function get_api(next) {

//  this.context.modules = w.api_doc.mdocs;
  this.context.moddoc = JSON
  .stringify(w.api_doc.mdocs);

  this.context.fns = JSON
  .stringify(Object.keys(w.api_doc.fdocs).map(key => w.api_doc.fdocs[key])
  );

  next();
};
