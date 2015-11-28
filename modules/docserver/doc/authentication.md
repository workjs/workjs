# WorkJS Authentication and User Management

WorkJS provides to create password hashes and check passwords and log users in and out.
This uses WorkJS Sessions, therefore if authentication is configured for a route,
sessions are also forced.

If a module flag *auth* is defined for a route, the WorkJS authentication is used.
It gets data of a currently logged in user from database. This data is made available as this.user.

### Module Flag: auth

### Configuration Options:

**bcrypt salt:** `conf.auth_salt = 10;`
The number of rounds (2^n) used to crypt and decrypt. Crypting becomes slow if this is set too high.
see [bcrypt](https://github.com/ncb000gt/node.bcrypt.js)

## Properties

### this.auth.hash(pw)
### work.auth.hash(pw)
create hash from password string

### this.auth.check(pw, hash)
### work.auth.check(pw, hash)
check if a hash matches a password string

### this.auth.login(user)
log the user in
user is an object containing the data of the user (see database table below).

### this.auth.logout()
log out the current user, clear the session

### work.auth.logout(user_id)
log out user with user_id, clear the matching session
