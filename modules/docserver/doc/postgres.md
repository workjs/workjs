# WorkJS Postgres

WorkJS works with the PostgreSQL database system.
You must install and start a PostgreSQL server.
The WorkJS implementation is based on [node-pg-native](https://github.com/brianc/node-pg-native).

If one of the module flags `dbCommit` or `dbRollback` is defined for a route,
the workJS postgres middleware is used with this route.
The request gets a transaction assigned (`this.tx`) which can be used to access the database.
At the end of a http connection the transaction is committed if `dbCommit` was specified and 
no error occured or rolled back otherwise. The transaction is lazy, 
no connection to the database server is used if no query is issued.

Query strings (sql) are constructed with bind variables as done 
in [openacs](http://openacs.org/doc/db-api.html).
Variable names with colon prefix are used within the SQL query string.
The variables are taken from an optional parameter object.

Examples:
~~~javascript
this.tx.query("SELECT * FROM work_users WHERE user_id=:id", {id:1});
this.tx.query("INSERT into work_session (id, last, data) VALUES (:id, :last, :data)",
  {id:this.session.id, last:this.session.last, data:this.session.data});
~~~

Database functions are also provided at the global work object at "w.db".
Use this in a global context where no transaction is started (e.g. package initialization) or 
if a database query must be done outside of the transaction.
These global database queries run in separate transactions and are automatically committed.

### Module Flags: dbCommit, dbRollback
Set dbRollback to "t" if you need a DB transaction which should be rolled back at the end of the http request.
This is the default for "GET" requests.

Set dbCommit to "t" if you need a DB transaction which should be committed at the end of the http request.
Nonetheless the transaction will roll back if an error happens.
This is the default for "POST".

### Configuration Options:

**Database Url:** `conf.db_url = "pg://fp@localhost/work";`
A connection string to access the postgres database.
see [postgresql.org Connection Strings](http://www.postgresql.org/docs/9.5/static/libpq-connect.html#LIBPQ-CONNSTRING)

**Database Pool Size:** `conf.db_poolsize = 20;`
Number of connections which are opened to the PostgreSQL server.
Additional requests are queued if an application requires more than this.

## Properties

### this.tx.query(sql, param)
### w.db.query(sql, param)
Perform query with query string sql and parameters param and return the array of result rows.

### this.tx.rows(sql[, param])
### w.db.rows(sql[, param])
alias to this.tx.query or w.db.query

### this.tx.one(sql[, param])
### w.db.one(sql[, param])
Perform query with query string sql and parameters param and return first result row.

### this.tx.only(sql[, param])
### w.db.only(sql[, param])
Perform query with query string sql and parameters param and return a single column value from 
first result row.

### this.tx.each(sql, param, fn)
### w.db.each(sql, param, fn)
Perform query with query string sql and parameters param and call function fn with each result row.
