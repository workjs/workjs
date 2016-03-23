<h1>WorkJS - SMTP</h1>

### w.smtp
w.smtp is a [Nodemailer](https://github.com/andris9/Nodemailer) transport.

Example usage:
~~~nohighlight
w.smtp.sendMail({from:this.conf.smtp_from, to:this.context.email, subject:"workJS Registration",
        text:mailtext, html:htmltext});
~~~
We currently use direct transmission of emails. This is not reliable and without special provision mails might 
end up in a spam folder. 
It usually will be better to use a smtp or pooled smtp transport to a local email server like postfix.
WorkJS will change this in future.
