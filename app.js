
module.exports = { run: run };

function run(conf) {
  conf.coredir = __dirname;
  require('./core/bootstrap.js')(conf);
};
