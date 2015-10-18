# WorkJS Postgres

WorkJS works with the PostgreSQL database system.
You must install and start a PostgreSQL server.
The WorkJS implementation is based on [node-postgres](https://github.com/brianc/node-postgres).

If one of the module flags `dbCommit` or `dbRollback` is defined for a route,
the workJS postgres middleware is used for this route.
The request gets a transaction assigned (`this.tx`) which can be used to access the database.
At the end of a request the transaction is committed if `dbCommit` was specified and 
no error occured or rolled back otherwise.

Query strings (sql) are constructed with bind variables as done 
in [openacs](http://openacs.org/doc/db-api.html).
Variable names with colon prefix are used within the SQL query string.
The variables are taken from an optional parameter object.

~~~javascript
this.tx.query("INSERT into work_session (id, last, data) VALUES (:id, :last, :data)",
  {id:this.session.id, last:this.session.last, data:this.session.data});
~~~

### Module Flags: dbCommit, dbRollback

### Configuration Options:

**Database Url:** `conf.db_url = "pg://fp@localhost/work";`
A connection string to access the postgres database. see [node-postgres](https://github.com/brianc/node-postgres/wiki/pg)

**Database Pool Size:** `conf.db_poolsize = 20;`
Number of connections which are opened to the PostgreSQL server.
Additional requests are queued if an application requires more than this.

## Properties

### this.tx
Database transaction opened for the current request.

### this.tx.rows(sql[, param])
Perform query with query string sql and parameters param and return the array of result rows.

### this.tx.one(sql[, param])
Perform query with query string sql and parameters param and return first result row.

### this.tx.query(sql, param)
Perform query with query string sql and parameters param and return result data structure.

### this.tx.each(sql, param, fn)
Perform query with query string sql and parameters param and call function fn with each result row.

The same functions are also available at module.work.db running in separate transactions: 
### module.work.db.rows(sql[, param])
### module.work.db.one(sql[, param])
### module.work.db.query(sql, param)
### module.work.db.each(sql, param, fn)
