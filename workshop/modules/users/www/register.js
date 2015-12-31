var w = module.work;

var confirmationEmailDelay = w.conf.auth_confirmationEmailDelay * 1000;

module.exports.post = function register(next) {
  var randomurl = this.randomStringAsBase64Url(this.conf.auth_randomUrlSize);
  var email=this.context.email;

  w.auth.conf_cache[randomurl] = {now:this.id, email:email};
  
  if (!w.auth.conf_cache[email] || 
     (this.id - w.auth.conf_cache[email] > confirmationEmailDelay)) {
    console.log("send email !!!! to ", email, randomurl);
    console.log(this.id, w.auth.conf_cache[email], confirmationEmailDelay, this.id - w.auth.conf_cache[email]);
    var conf_link = "http://localhost:3000/auth/confirmation/" + randomurl;
    var mailtext = "To complete registration with WorkJS follow this link: "+conf_link+" !"
    var htmltext = "To complete registration with WorkJS follow this link: "
        + "<a href='"+conf_link+"'>Confirm WorkJS Registration</a> !";
    this.work.smtp.sendMail({from:this.conf.smtp_from, to:this.context.email, subject:"workJS Registration",
        text:mailtext, html:htmltext});
    };
    w.auth.conf_cache[email] = this.id;

  next();
};
