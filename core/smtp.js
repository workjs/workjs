var nodemailer = require("nodemailer");

var w = module.work;

//w.smtp = {};

w.smtp = nodemailer.createTransport();
// w.smtp.from = w.conf.smtp_from;

