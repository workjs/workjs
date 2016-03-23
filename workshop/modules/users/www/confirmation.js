
//require("../lib/init.js");

var confirmationTimeout = w.conf.auth_confirmationTimeout * 1000;

module.exports.get = function confirmation(next) {
  var randomurl = this.context._location;
  
  if (w.auth.conf_cache[randomurl] &&
     (this.id - w.auth.conf_cache[randomurl].now < confirmationTimeout)) {
    console.log("ddd", w.auth.conf_cache[randomurl].email);
    w.auth.conf_cache[randomurl].now = this.id;
    this.context.email = w.auth.conf_cache[randomurl].email;
    
    next();
    
  } else { this.reply3xx(303, "/register?mode=expired"); };

};

//    delete w.auth.conf_cache[randomurl];  

module.exports.post = function confirmation(next) {
  var randomurl = this.context.randomurl;
  if (w.auth.conf_cache[randomurl] &&
     (this.id - w.auth.conf_cache[randomurl].now < confirmationTimeout)) {

    var email = w.auth.conf_cache[randomurl].email;
    var hash = w.auth.hash(this.context.pw);
    
    if (email) {
      var user_id = this.db.only("insert into work_users (email, nick, hash) values (:email, :nick, :hash)"
      +" on CONFLICT (email) DO UPDATE set nick=:nick, hash=:hash"
      +" returning user_id", {email: email, nick: this.context.nick, hash:hash});
      this.reply3xx(303, "/login?email="+email);
    } 

  };
  
  this.reply3xx(303, "/register?mode=expired");

};
  