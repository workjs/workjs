
module.exports.get = function get_api(next) {

  this.context.mod = w.api_doc.mdocs;
  this.context.mod_keys = Object.keys(w.api_doc.mdocs).sort();
  next();

};
