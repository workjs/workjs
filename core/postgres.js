var pg = require('pg');

var w = module.work;
w.sqlcache = {};

module.exports = function(options) {
  var poolsize = options.poolsize;
  var dburl = options.dburl;

  var db = new DB();
  for (var i = 1; i <= poolsize; i++) {
    var client = new pg.Client(dburl);
    client.connect(function(err){
      if (err){
        console.log("ERR cannot create DB Client ("+i+") for: "+dburl+" <"+err+">");
        process.exit(1);
      };
    });
    db.stock(client);
  };
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
    var start_arg0 = null;
    var start_arg1;
    var start_arg2;

    this.start = function(client) { //we got a client -> start this transaction
      //start_arg1 or start_arg2 could be a callback
      my_client = client;
      my_client.query("BEGIN");
      my_client.query(start_arg0, start_arg1, start_arg2);
    };
    
    this.pg_query = function(arg0, arg1, cb) {
        if (start_arg0) {
          my_client.query.call(my_client, arg0, arg1, cb);
        } else {
          start_arg0 = arg0;
          start_arg1 = arg1;
          start_arg2 = cb;
          dbm.enqueue(tx);
        }
    };
    
    this.pg_query_sync = function(arg0, arg1) {
      return(tx.pg_query.sync(tx, arg0, arg1));
    };

    this.commit = function(cb) {
      if (start_arg0) {
        my_client.query("COMMIT", function(e){
          dbm.stock(my_client);
          cb && cb(e);
        });
      } else {
        cb && cb();
      };
    };
    
    this.commit_sync = function() {
      return(tx.commit.sync(tx));
    };

    this.rollback = function(cb) {
      if (start_arg0) {
        my_client.query("ROLLBACK", function(e){
          dbm.stock(my_client);
          cb && cb(e);
        });
      } else {
        cb && cb();
      };
    };
    
    this.rollback_sync = function() {
      return(tx.rollback.sync(tx));
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
      return(this.pg_query_sync.call(this, r, q));
    };
    
    this.rows = function rows(sql, param) {
      return(this.query(sql, param).rows);
    };
    
    this.one = function one(sql, param) {
      return(this.query(sql, param).rows[0]);
    };
    
    this.only = function only(sql, param) {
      var one = this.query(sql, param).rows[0];
      if (one) { return(one[Object.keys(one)[0]]); }
      else return(null);
    };
    
    this.each = function each(sql, param, fn) {
      var r = this.query(sql, param).rows;
      for (var i = 0; i < r.length; i++) { fn(r[i]); };
    };
    
  };
  
  //DB level methods in own transaction
  this.query = function query(sql, param) {
    var tx = dbm.begin();
    var r = tx.query(sql, param);
    tx.commit_sync();
    return r;
  };
  
  this.rows = function rows(sql, param) {
    return(dbm.query(sql, param).rows);
  };
  
  this.one = function one(sql, param) {
    return(dbm.query(sql, param).rows[0]);
  };
  
  this.only = function only(sql, param) {
    var one = dbm.query(sql, param).rows[0];
    if (one) { return(one[Object.keys(one)[0]]); }
    else return(null);
  };
  
  this.each = function each(sql, param, fn) {
    var r = dbm.query(sql, param).rows;
    for (var i = 0; i < r.length; i++) { fn(r[i]); };
  };
  
};

//middlewares
function rollback(next) {
      this.tx = this.work.db.begin();
      next();
      this.tx.rollback_sync();
};

function commit(next) {
      this.tx = this.work.db.begin();
      next();
      if (this.error) { this.tx.rollback_sync(); }
      else { this.tx.commit_sync(); }
};


//helper functions
function sqlparser() {
  var i = 0;
  var p = [];

  this.next=function(match){
    p.push(match.substr(1));
    return "$"+ ++i
  };

  this.param=function(){ return(p); };
};
