function worksocket(msghandler) {
  var ws;
  var timeout;
  var wsc = this;
  var events = {};
  var rpc_seq = 1;
  var rpc_list = {};

  this._open = function(){
    ws = new WebSocket('ws://'+ window.location.host + window.location.pathname);

    ws.onopen = function(){
      timeout = 1000;
    };

    ws.onclose = function(){
      if (timeout < 7000) timeout=2*timeout;
      setTimeout(function () { wsc._open(); }, timeout);
    };
    
    ws.onmessage = function(event) {
      console.log("message", event.data);
      var m = JSON.parse(event.data);
      console.log("m", m);
      if (m[0] === "_rpc") {
        var rpc_id = m[2];
        rpc_list[rpc_id].call(null, m[1]);
        delete rpc_list[rpc_id];
      } else { events[m[0]].call(null, m[1]); }
    };

    ws.onerror = function(){
      console.log("ws.onerror");
    };

  };

  this.sendJSON = function(o){
    ws.send(JSON.stringify(o));
  };

  this._open();
  
  this.call = function(proc, params, seq) {
    if (seq) {
      this.sendJSON([proc, params, seq]);
    } else {
      this.sendJSON([proc, params]);
    }
  };
  
  this.on = function(event, f) {
    events[event] = f;
  };
  
  this.rpc = function(proc, params, cb) {
    var rpc_id = rpc_seq++;
    rpc_list[rpc_id] = cb;
    this.call(proc, params, rpc_id);
  };
};
