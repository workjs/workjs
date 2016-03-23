w.ws_nodes = {};

function verifyClient(info) {
  return (info.origin === w.conf.origin);
};

module.exports.server = function(server) {
  var wss = new w.dep.ws.Server({server:server, verifyClient:verifyClient});
  
  wss.on('connection', function connection(ws){
    w.dep.syncho(function WSrequest_handler() {
      var context = w.newWSContext(ws);
      ws_route.call(context);
    });
  });
};

function ws_route() {
    var me = this;
    this.method = this.ws.upgradeReq.method.toLowerCase();
    var n = w.map[this.method];
    
    this.url = w.dep.url.parse(this.ws.upgradeReq.url, true);
    this.query = this.url.query || {};
    this.context = {};
    for (var e in this.query) { this.context[e] = this.query[e] }
    this.context._work = this;
    
    var p = this.url.pathname.split('/');
    console.log(this.ws.upgradeReq.url, "WS ===============> " + this.ws.upgradeReq.method.toUpperCase(), p);
    
    for (var i = 1; i < p.length; ++i) {
      var segment = p[i];
      if (n.branches[segment]) { n = n.branches[segment]; continue };
      if (n.branches[':']) { //varname
        this.context[n.varname] = segment;
        n = n.branches[':'];
        continue
      };
      if (n.branches['*']) { //wildcard
        this.context['_location'] = p.slice(i).join('/');
        n = n.branches['*'];
        break
      };
    };
    
    if (n.ws) {
      this.n = n;
      var cookie = new w.dep.cookies( this.ws.upgradeReq, null, w.conf.session_secrets);
      var id = cookie.get(w.conf.cookiename, { signed: true });

      if (id && id > 0 && w.session.cache[id]) {
        this.sess = w.session.cache[id].data;
        console.log("ws.upgradeReq.url", this.ws.upgradeReq.url);
        console.log("ws.upgradeReq", this.ws.upgradeReq.remoteAddress);
      } else {
        this.sess = {data:{user_id:0}};
      };
      
      //server side open event missing, but we can call init now
      var key = n.ws.init && n.ws.init.call(this);
      console.log("GROUP", key);
      if (key) {

        this.group_id = key;
        if (!w.ws_nodes[n.id][key]) w.ws_nodes[n.id][key] = {};
        this.group = w.ws_nodes[n.id][key];
        w.ws_nodes[n.id][key][this.id] = this;
        
        this.ws.on('error', function (error) {
          console.log("WS ERROR", error);
        });
        
        this.ws.on('close', function(code, message) {
          console.log("WS CLOSE ##########################", code, message);
          console.log("WS CLOSE ################", n.id, key, me.id);
          console.log(n.ws.exit);
          n.ws.exit && n.ws.exit.call(me);
          delete w.ws_nodes[n.id][key][me.id];
        }.wrap());
        
        this.ws.on('message', function(message) {
          var m = JSON.parse(message);
          console.log("M:", m);
          //we can only use the global log function as we are not linked with the original request
          //if rpc ?
          if (m[2]) {
            try {
              var r = n.ws[m[0]].call(me, m[1]); 
              console.log("reply RPC", "_rpc", JSON.stringify(r), m[2]);
              this.send(JSON.stringify(["_rpc", r, m[2]]));
            }
            catch (e) { w.log('ERROR calling WS handler: ' + m[0] + ' ( ' + m[1] + ' ) --'+e) };
          } else {
            try { n.ws[m[0]].call(me, m[1]); }
            catch (e) { w.log('ERROR calling WS handler: ' + m[0] + ' ( ' + m[1] + ' ) --'+e) };
          };
        }.wrap());
      
      } else {
        console.log("WS Access denied");
        this.ws.close(1008, "Access denied");
      }
    };
};

w.ws_mw = function ws_mw(next) {
  //add ws client initialization
  this.add_js("/static/ws.js");
  next();
};
