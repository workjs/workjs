
w.module("pg", `Postgresql database interface, based on pg-native`);

w.pg.create_db = function create_db(options) {
  var poolsize = options.poolsize;
  var dburl = options.dburl;

  var db = new DB();
  for (var i = 1; i <= poolsize; i++) {
    var client = new w.dep.pg_native();
    client.connectSync(dburl);
    db.stock(client);
  };
  return db;
}.doc(`Create a database connection pool with the given database URL and poolsize.`);

function DB() {
  var dbm = this;
  var pool = []; //our pool of DB clients
  var queue = []; //queue of transactions waiting for a client
  
  dbm.sqlcache = {};
  
  this.stock = function stock(client) {
    if (queue.length) { //there is a transaction waiting
      var tx = queue.shift();
      tx.start(client);
    } else {
      pool.push(client);
    };
  };

  this.enqueue = function enqueue(tx) {
    if (pool.length) { //we have a spare client
      var client = pool.shift();
      tx.start(client);
    } else {
      queue.push(tx);
    };
  };
  
  this.begin = function begin(){
    return(new TX());
  };
  
  function TX(){
    var tx = this;
    var my_client = null;
    var startCB;
    
    this.enqueue = function enqueue(cb) {
      startCB = cb;
      dbm.enqueue(tx);
    };
    
    this.start = function start(client) { //we got a client -> start this transaction
      my_client = client;
      startCB();
    };
    
    this.queryPG = function queryPG(qt, pa) {
      if (my_client) { return my_client.querySync(qt, pa); }
      else {
        this.enqueue.sync(null);
        my_client.querySync("BEGIN");
        return my_client.querySync(qt, pa);
      };
    };

    this.commit = function commit() {
      if (my_client) {
        my_client.querySync("COMMIT");
        dbm.stock(my_client);
      };
    };

    this.rollback = function rollback() {
      if (my_client) {
        my_client.querySync("ROLLBACK");
        dbm.stock(my_client);
      };
    };
    
    this.query = function query(sql, param) {
      if (dbm.sqlcache.hasOwnProperty(sql)) {
        var x = dbm.sqlcache[sql];
        var r = x.sql;
        var p = x.param;
      } else {
        var parser = new sqlparser(param);
        var r = sql.replace(/:\w+/g, parser.next);
        var p = parser.param();
        dbm.sqlcache[sql]={sql:r, param:p};
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
