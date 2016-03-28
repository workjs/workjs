//this is the global work object

w.id = "---"; //used in logging

w.work = w;

w.marked = function marked(md) {
   return w.dep.marked(md)
};

//http://stackoverflow.com/questions/8855687/secure-random-token-in-node-js/25690754#25690754
//size is the unencoded size, therefore the returned string will be longer
w.randomStringAsBase64Url = function randomStringAsBase64Url(size) {
   return w.dep.base64url(w.dep.crypto.randomBytes(size));
};

w.proto.sleep = function sleep(ms) {
   w.dep.syncho.sleep(ms);
};

var unique = 0;
w.unique = function unique() {
   var u = Date.now();
   while (u <= unique) u++;
   unique = u;
   return u;
};
