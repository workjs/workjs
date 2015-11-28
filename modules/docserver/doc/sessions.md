# WorkJS Sessions

WorkJS provides a cookie based session support (server side).
It uses signed [cookies](https://github.com/pillarjs/cookies).

It uses an in memory session cache and persists session data in the database.
Data assigned to a session is kept in the session cache and written to the database, 
so it will not be lost if you restart the server.
To prevent denial of service attacks, a fresh session without data is only stored in the cookie.
The absence from the database of old, dropped sessions is also cached.

If a module flag *session* is defined for a route, the workJS session middleware is used.
It extracts session data if available and assigns a new session if necessary.

A request with the session flag set, has the current session data in this.session.data
and new session data can be stored with this.session.set() .

### Module Flag: session

### Configuration Options:

**Session secrets:** `conf.session_secrets = ["Top Secret"];`
Array of secrets used to sign the session cookie.

**Update:** `conf.session_update = 60;`
The session access time is updated in the database if more than conf.session_update seconds 
passed since the last update.

**Decline:** `conf.session_decline = 2 * 24 * 60 * 60;`
Time after which a session if not used is dropped from cache and database.

**Sweep:** `conf.session_sweep = 120;`
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

### this.session.create()
Create a new session with an unique ID. Stores it in a signed session cookie.
Sessions are created automatically if the session module flag is set.
You do not need to call this.session.create.

### this.session.clear()
Deletes the session from the session cache and assigns a new session to the current request.
Does not delete sessions from the database - the sweeper will do.
You can call this to e.g. log an user out.
But you could also keep the session and only delete the session data.

### work.session.clear(path, value)
Use postgreSQL JSON path to select and delete session from database and from session cache.
This is to e.g. kick a user.

### work.sessions
Session cache in Memory.

### work.session.mw
session middleware function

### work.session.update
conf.session_update

### work.session.decline
conf.session_decline

### work.session.sweep
conf.session_sweep

### work.session.sweeper
interval timer which removes declined sessions

### work.session.drop
last sweeper run

### Database table: work_session
Database table used to store session data.

