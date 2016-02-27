
module.exports.get  = function chat(next) {
  this.context.group = this.work.chat.get_group(this.context.key);
  this.body = "" + this.context.mode + this.context.title + this.context.pw;
//  var key = this.randomStringAsBase64Url(40);
//  var chat = this.db.one("INSERT INTO work_chat (key, title) VALUES (:key, :title) RETURNING chat_id, creation",
//    {key:key, title:this.context.title});
//  this.cache.chat_groups[key] = {id:chat.chat_id, title:this.context.title, creation:chat.creation};
  next()
};
