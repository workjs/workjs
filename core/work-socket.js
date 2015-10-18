var ws = module.require("ws");

function verifyClient(info) {
  console.log("verifyClient");
  console.log(info.req);
  return true;
};

module.exports.server = function(server) {
  var woss = new ws.Server({server:server, verifyClient:verifyClient});
};
