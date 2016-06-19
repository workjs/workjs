# WorkJS Sessions

WorkJS provides a cookie based session support (server side).
It uses signed cookies.

It uses an in memory session cache and persists session data in the database.
Data assigned to a session is kept in the session cache and written to the database, 
so it will not be lost if you restart the server.

To prevent denial of service attacks, a fresh session without data is not stored.
The absence from the database of old, dropped sessions is also cached.

If a route defines a module flag *session*, the workJS session middleware is used.
The session middleware extracts session data if available and assigns a new session if necessary.

If the session flag is set, the current request context contains the current session data in this.session.data.
New session data can be stored with this.session.set().

### Module Flag: session

### Configuration Options:

**Name of session cookie:** `w.conf.session_cookie = "work:sess";`

**Update:** `w.conf.session_update = 60;`
The session access time is updated in the database if more than conf.session_update seconds 
passed since the last update.

**Fresh:** `w.conf.session_fresh = 20;`
Wait until first write to DB.

**Decline:** `w.conf.session_decline = 2 * 24 * 60 * 60;`
Time after which a session if not used is dropped from cache and database.

**Sweep:** `w.conf.session_sweep = 120;`
Interval to run the sweep function to clean declined sessions from cache and database.

## Properties

### this.session.id
The unique identifier of the current session.
This is also the timestamp of session start.
New sessions are not remembered on the server side and marked with a negative id.

### this.session.last
Timestamp of last update of the session in the database.
this.session.last is zero of session was not persisted in the database.

### this.session.data
The current session data object.

### this.session.set(key, value)
Put data into the session and persist the current session in the database.

### this.session.get(key)
Get data from session.

### this.session.clear()
Delete current session cookie, clear cache and prepare new session.
Does not delete sessions from the database - the sweeper will do.
You can call this to e.g. log an user out.

### w.session.cache
Session cache in Memory.

### w.session.mw(next)
session middleware function
fetch session from cookie and cache and DB, create new session if none present

### w.session.sweeper
interval timer which removes declined sessions

### Database table: work_session
Database table used to store session data.

