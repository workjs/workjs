w.module("cookie", `Support to set, sign and get cookies.`);

w.db.query("create table IF NOT EXISTS work_keyring " +
           "(id serial PRIMARY KEY, key text);" );

//loop the keys from 0 to conf.cookie_keycount
var keyi = 0;
var keyring = [];

for (var i=0; i<w.conf.cookie_keycount; i++) {
  var k = w.db.only("select key from work_keyring where id=:i", {i:i});
  if (k) { keyring[i] = k }
  else {
    keyring[i] = k = w.randomStringAsBase64Url(80);
    w.db.only("insert into work_keyring (id, key) values (:i, :k)", {i:i, k:k});
  };
};

w.cookie.mw = function cookie_mw(next) {
  //get current cookies from request
  this.cookies = w.dep.cookie.parse(this.req.headers.cookie || '');
  //prepare list of cookies to send with this reply
  this.setCookies = [];
  next();
  //set response cookies
  this.res.setHeader('Set-Cookie', this.setCookies);
}.doc(`cookie middleware:
Fetch current cookies from request header and put them into this.cookies.
Write new cookies set with this.set_cookie into set_cookies reply header.`);

w.cookie.set = function set_cookie(name, val, opt) {
  if (opt) {
    opt.httpOnly = (opt.httpOnly !== undefined) ? opt.httpOnly : true;
  } else {
    opt = {httpOnly:true}
  };

  this.setCookies.push(w.dep.cookie.serialize(name, val, opt));

  if (opt.sign) {
    var sigName = name + ".sig";
    
    if (++keyi >= w.conf.cookie_keycount) { keyi=0 }
    var idx = keyi;
    var sigKey = keyring[idx];
    var KG = (new w.dep.keygrip([sigKey]));
    opt.httpOnly = true;
    this.setCookies.push(w.dep.cookie.serialize(sigName, idx+'.'+KG.sign(val), opt));
  };
}.doc(`put cookie and optional signature cookie into this.setCookies`);

w.cookie.get = function get_cookie(name) {
  return this.cookies[name];
}.doc(`get cookie value from this.cookies`);

w.cookie.get_signed = function get_signed_cookie(name) {
  var sign;
  if ((name in this.cookies) && (sign = this.cookies[name+'.sig'])) {
    const val = this.cookies[name];
    const arr = sign.split('.');
    const KG = (new w.dep.keygrip([keyring[arr[0]]]));
    if (KG.sign(val) === arr[1]) return val;
  };
  return undefined
}.doc(`get signed cookie value from this.cookies,
verify signature`);
