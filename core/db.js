
w.module("db", `Default database interface, based on module pg_native.`);

w.db = w.pg.create_db({dburl:w.conf.db_url, poolsize:w.conf.db_poolsize});

w.db.mw_rollback = function mw_rollback(next) {
  this.tx = w.db.begin();
  next();
  this.tx.rollback();
};

w.db.mw_commit = function mw_commit(next) {
  this.tx = w.db.begin();
  next();
  if (this.error) { this.tx.rollback(); }
  else { this.tx.commit(); }
};
