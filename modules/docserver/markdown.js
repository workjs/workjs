
module.exports.get = function docserver_get(next) {
  if (!this.context._location) this.context._location = "index.md";
  this.context.md
    = this.marked(w.dep.fs.readFileSync(__dirname+"/doc/"
      +this.context._location).toString());
  this.debug("md generated");
  next();
};
