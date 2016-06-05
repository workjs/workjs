# WorkJS Cookies

WorkJS supports cookie management for signed and unsigned cookies.

A keyring with conf.cookie_keycount (default 1000) random keys is generated 
on startup  and stored in the database. This keys are used to sign keys.

Add the cookie middleware to your map to get cookies from the request header 
into this.cookies.current and put new cookies set into the reply header.

### Module Flag: cookies
Add "cookies":"t" or "cookies":"f" to the route MAP to make cookies work or disable 
cookies for a route.

### Configuration Options:

**Key count:** `conf.cookie_keycount = 1000;`
Number of random keys to generate for signing cookies.
Keys are generated on first server start and stored in the database table "work_keyring".

## Properties

### this.cookies.current
Object containing all cookies got with the request.
This ist set from the cookie middleware.

### this.cookies.setCookies
Array of cookies to send out with the reply.

### this.cookies.set(name, val, opt)
Put a cookie into this.cookies.setCookies to be sent out with the reply.
"opt" are the options from [jshttp/cookie](https://github.com/jshttp/cookie).
In addition pass "sign:true" as option to get the cookie signed.
This uses the keyring to add an additional signature cookie "name.sig".

### this.cookies.get(name)
Get the cookie value from this.cookies.current.

### this.cookies.get_signed(name)
Get signed cookie value from this.cookies.current 
- i.e. checks if a valid signature cookie exists 
and returns the cookie value from this.cookies.current.

### Database table: work_keyring
Database table used to store a set of random key for cookie signing.

### w.cookies.mw(next)
cookie middleware function
Fetch cookie values from request header and write set_cookies into reply.
