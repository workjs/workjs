w.module("cookies", `Support to set, sign and get cookies.`);

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

w.cookies.mw = function cookies_mw(next) {
  //get current cookies from request
  this.cookies = new w.cookies.proto(this);
  next();
  //set response cookies
  this.cookies.reply();
}.doc(`cookies middleware:
Fetch current cookies from request header and put them into this.cookies.   
Write new cookies set with this.cookies.set into reply header.`);

w.cookies.proto = function Cookies(wrk) {
  this.wrk = wrk;
  //get current cookies from request
  this.current = w.dep.cookie.parse(wrk.req.headers.cookie || '');
  //prepare list of cookies to send with this reply
  this.setCookies = [];
}.doc(`cookies prototype:
holds current cookies from the request and new set cookies to send with the reply.`);

w.cookies.proto.prototype.reply = function cookies_reply() {
  this.wrk.res.setHeader('Set-Cookie', this.setCookies);
}.doc(`Write new cookies set with this.cookies.set into reply header.`);

w.cookies.proto.prototype.set = function cookies_set(name, val, opt) {
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
}.doc(`Prepare a cookie and optional a signature cookie to be sent with the reply.`);

w.cookies.proto.prototype.get = function cookies_get(name) {
  return this.current[name];
}.doc(`get value of cookie with name from current cookies.`);

w.cookies.proto.prototype.get_signed = function cookies_get_signed(name) {
  var sign;
  if ((name in this.current) && (sign = this.current[name+'.sig'])) {
    const val = this.current[name];
    const arr = sign.split('.');
    const KG = (new w.dep.keygrip([keyring[arr[0]]]));
    if (KG.sign(val) === arr[1]) return val;
  };
  return undefined
}.doc(`verify signature and get value of a signed cookie value from current cookies.`);
