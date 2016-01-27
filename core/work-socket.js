var w = module.work;
var ws = module.require("ws");
var url = require('url');

function thisW(ws) {
  this.ws = ws;
  context = {};
};

thisW.prototype.sendJSON = function(o){
  this.ws.send(JSON.stringify(o));
};

thisW.prototype.emit = function emit(event, params) {
  console.log("thisW.prototype.emit");
  this.sendJSON([event, params]);
};

function verifyClient(info) {
  return (info.origin === w.conf.origin);
};

module.exports.server = function(server) {
  var wss = new ws.Server({server:server, verifyClient:verifyClient});
  
  wss.on('connection', function connection(ws){
    var W = new thisW(ws);

    var cookie = new w.dependencies.cookies( ws.upgradeReq, null, w.conf.session_secrets);
    var id = cookie.get(w.conf.cookiename, { signed: true });

    if (id && id > 0 && w.session.cache[id]) {
      W.sess = w.session.cache[id].data;
      console.log("ws.upgradeReq.url", ws.upgradeReq.url);
      console.log("ws.upgradeReq", ws.upgradeReq.remoteAddress);
    } else {
      W.sess = {data:{user_id:0}};
      
    };
    
    var n = w.map[ws.upgradeReq.method.toLowerCase()];
    var p = ws.upgradeReq.url.split('/');
    
    for (var i = 1; i < p.length; ++i) {
      var segment = p[i];
      if (n.branches[segment]) { n = n.branches[segment]; continue };
      if (n.branches[':']) { //varname
        context[n.varname] = segment;
        n = n.branches[':'];
        continue
      };
      if (n.branches['*']) { //wildcard
        context['_location'] = p.slice(i).join('/');
        n = n.branches['*'];
        break
      };
    };
    
    if (n.ws) {
      //open was fired too early, but we can call init now
      n.ws.init && n.ws.init.call(W);
      
      ws.on('error', function (error) {
        console.log("WS ERROR", error);
      });

      ws.on('message', function(message) {
        var m = JSON.parse(message);
        console.log("M:", m);
        //we can only use the global log function as we are not linked with the original request
        //if rpc ?
        if (m[2]) {
          try {
            var r = n.ws[m[0]].call(W, m[1]); 
            console.log("reply RPC", "_rpc", JSON.stringify(r), m[2]);
            ws.send(JSON.stringify(["_rpc", r, m[2]]));
          }
          catch (e) { w.log('ERROR calling WS handler: ' + m[0] + ' ( ' + m[1] + ' ) ') };
        } else {
          try { n.ws[m[0]].call(W, m[1]); }
          catch (e) { w.log('ERROR calling WS handler: ' + m[0] + ' ( ' + m[1] + ' ) ') };
        };
      });

    };
  });
};

w.ws_mw = function ws_mw(next) {
  //add ws client initialization
  this.add_js("/static/ws.js");
  next();
};
