
function worksocket(param) {
  //param.onopen
  var ws;
  var timeout;
  var stop = true;
  var events = {};
  var rpc_seq = 1;
  var rpc_list = {};
  var queue = [];
  var Qstop = true;
  var error = false;
  
  this.print = function(){
    console.log("WS:", timeout, events,rpc_seq, rpc_list, queue, stop, error);
  };
  
  function _open() {
    stop = false;
    console.log("ws. _open");
    ws = new WebSocket('ws://'+ window.location.host + window.location.pathname);
    console.log(ws);

    ws.onopen = function() {
      console.log("ws.onopen");
      timeout = 1000;
      if (param.onopen) param.onopen();
      run();
    };

    ws.onclose = function() {
      console.log("ws.close");
      stop = true;
      if (timeout < 7000) timeout=2*timeout;
      setTimeout(_open, timeout);
    };
    
    ws.onmessage = function(event) {
//      console.log("message", event.data);
      var m = JSON.parse(event.data);
      console.log("message ....", m);
      console.log("events", events);
      if (m[0] === "_rpc") {
        var rpc_id = m[2];
        rpc_list[rpc_id].call(null, m[1]);
        delete rpc_list[rpc_id];
      } else { events[m[0]].call(null, m[1]); }
    };

    ws.onerror = function(){
      error = true;
      console.log("ws.onerror");
    };

  };
  
  function run(){
    console.log("Qrun");
    Qstop = false;
    while (queue.length > 0 && !stop && ws.readyState === 1) {
      ws.send(JSON.stringify(queue[0]));
      if (!error) queue.shift();
    }
    Qstop = true;
    console.log("Qstop");
  };

  this.sendJSON = function(o){
    console.log("sendJSON", o, stop, Qstop);
    queue.push(o);
    if (Qstop && ws.readyState === 1) run();
  };
  
  _open();
  
  this.call = function(proc, params, seq) {
    console.log("call");
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
    if (cb) {
      var rpc_id = rpc_seq++;
      rpc_list[rpc_id] = cb;
      this.call(proc, params, rpc_id);
    } else if (typeof params === 'function') {
      this.call(proc, null, params);
    } else {
      this.call(proc, params, null);
    }
  };
};
