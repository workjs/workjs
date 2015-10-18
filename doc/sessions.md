# WorkJS Sessions

WorkJS provides a cookie based session support (server side).
It uses signed [cookies](https://github.com/pillarjs/cookies).

It uses an in memory session cache. 
Data assigned to a session is kept in the session cache and written to the database, 
so it will not be lost if you restart the server.
To prevent denial of service attacks, a fresh session without data is not stored at all.
The absence from the database of old, dropped sessions is also cached.

If a module flag `session` is defined for a route, the workJS session middleware is used.
It extracts session data if available and assigns a new session if necessary.

A request with the session flag set, has the current session data in this.session.data
and new session data can be stored in this.session.data.

### Module Flag: session

### Configuration Options:

**Session secrets:** `conf.session_secrets = ["Top Secret"];`
Array of secrets used to sign the session cookie.

**Fresh:** `conf.session_fresh = 30;`
Time in seconds for which a session if not cached is assumed to be empty.

**Update:** `conf.session_update = 60;`
Time in seconds before we update the session access time in the database.

**Decline:** `conf.session_decline = 2 * 24 * 60 * 60;`
Time after which a session if not used is dropped.

**Sweep:** `conf.session_sweep = 120;`
Interval to run the sweep function to clean declined sessions from cache and database.

## Properties

### this.set_session()
Persist the current session in the database. You can use this in a login work flow.

### this.new_session()
Create a new session with an unique ID. Stores it in a signed session cookie.
Sessions are created automatically if the session module flag is set.
You do not need to call this.new_session in this case.

### this.clear_session()
Deletes the session from the session cache and assigns a new session to the current request.
Does not delete sessions from the database (the sweeper will do).
You can call this to e.g. log an user out.
But you could also keep the session and only delete the session data.

### this.session.data
Get current session data or store new session data (object).

### this.session.id
The unique identifier of the current session.
This is also the timestamp of session start.

### this.session.last
Timestamp of last update of the session in the database.

### Database table: work_session
Database table used to store session data.


