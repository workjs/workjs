var fs = module.require('fs');

module.exports.get = function get_plain(next) {
  this.context.plain = fs.readFileSync(this.context._location)
  .toString()
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');
  next();
};
