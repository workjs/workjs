
module.exports.post  = function chat_home(next) {
  this.body = this.context.mode + this.context.title + this.context.pw;
  var key = this.randomStringAsBase64Url(20);
  var pw = this.context.pw || "";
  var chat = this.db.one("INSERT INTO work_chat (key, title, code) VALUES (:key, :title, :pw) " +
    "RETURNING chat_id, to_char(creation, 'YYYY-MM-DD HH24:MI') AS creation",
    {key:key, title:this.context.title, pw:this.context.pw});
  this.cache.chat_groups[key] = {id:chat.chat_id, title:this.context.title, creation:chat.creation};
  this.reply3xx(303, this.mapnode.moduleprefix+"/"+key);
};
