
w.sqlcache = {};

module.exports = function(options) {
  var poolsize = options.poolsize;
  var dburl = options.dburl;

  var db = new DB();
  for (var i = 1; i <= poolsize; i++) {
    var client = new w.dep.pg_native();
    client.connectSync(dburl);
    db.stock(client);
  };
  w.proto.db = db;
  return { db:db, rollback:rollback, commit:commit };
};

function DB() {
  var dbm = this;
  var pool = []; //our pool of DB clients
  var queue = []; //queue of transactions waiting for a client
  
  this.stock = function(client) {
    if (queue.length) { //there is a transaction waiting
      var tx = queue.shift();
      tx.start(client);
    } else {
      pool.push(client);
    };
  };

  this.enqueue = function(tx) {
    if (pool.length) { //we have a spare client
      var client = pool.shift();
      tx.start(client);
    } else {
      queue.push(tx);
    };
  };
  
  this.begin = function(){
    return(new TX());
  };
  
  function TX(){
    var tx = this;
    var my_client = null;
    var startCB;
    
    this.enqueue = function(cb) {
      startCB = cb;
      dbm.enqueue(tx);
    };
    
    this.start = function(client) { //we got a client -> start this transaction
      my_client = client;
      startCB();
    };
    
    this.queryPG = function(qt, pa) {
      console.log("this.queryPG", qt);
      if (my_client) { return my_client.querySync(qt, pa); }
      else {
        this.enqueue.sync(null);
        my_client.querySync("BEGIN");
        return my_client.querySync(qt, pa);
      };
    };

    this.commit = function() {
      if (my_client) {
        my_client.querySync("COMMIT");
        dbm.stock(my_client);
      };
    };

    this.rollback = function() {
      if (my_client) {
        my_client.querySync("ROLLBACK");
        dbm.stock(my_client);
      };
    };
    
    this.query = function query(sql, param) {
      if (w.sqlcache.hasOwnProperty(sql)) {
        var x = w.sqlcache[sql];
        var r = x.sql;
        var p = x.param;
      } else {
        var parser = new sqlparser(param);
        var r = sql.replace(/:\w+/g, parser.next);
        var p = parser.param();
        w.sqlcache[sql]={sql:r, param:p};
      };
      var q = [];
      for (var i=0; i<p.length; i++) {
        q.push(param[p[i]]);
      };
      try { var r = this.queryPG(r, q); } catch (e) {
        w.log("ERROR in SQL query", e.toString(), "SQL:" + r, "Param:" + q);
        w.log(new Error().stack);
        return null;
      };
      return r;
    };
    
    this.rows = this.query;
    
    this.one = function one(sql, param) {
      return(this.query(sql, param)[0]);
    };
    
    this.only = function only(sql, param) {
      var one = this.query(sql, param)[0];
      if (one) { return(one[Object.keys(one)[0]]); }
      else return(null);
    };
    
    this.each = function each(sql, param, fn) {
      var r = this.query(sql, param);
      for (var i = 0; i < r.length; i++) { fn(r[i]); };
    };
    
  };
  
  //DB level methods in own transaction
  this.query = function query(sql, param) {
    var tx = dbm.begin();
    var r = tx.query(sql, param);
    tx.commit();
    return r;
  };
  
  this.rows = this.query;
  
  this.one = function one(sql, param) {
    return(dbm.query(sql, param)[0]);
  };
  
  this.only = function only(sql, param) {
    var one = dbm.query(sql, param)[0];
    if (one) { return(one[Object.keys(one)[0]]); }
    else return(null);
  };
  
  this.each = function each(sql, param, fn) {
    var r = dbm.query(sql, param);
    for (var i = 0; i < r.length; i++) { fn(r[i]); };
  };
  
};

//middlewares
function rollback(next) {
      this.tx = w.db.begin();
      next();
      this.tx.rollback();
};

function commit(next) {
      this.tx = w.db.begin();
      next();
      if (this.error) { this.tx.rollback(); }
      else { this.tx.commit(); }
};


//helper functions
function sqlparser(params) {
  var i = 0;
  var p = [];

  this.next=function(match){
    if (params.hasOwnProperty(match.substr(1))) {
      p.push(match.substr(1));
      return "$"+ ++i
    } else { return match }
  };

  this.param=function(){ return(p); };
};
