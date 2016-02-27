
module.exports.init = function init() {
  this.context.chat = this.work.chat.get_group(this.context.key);
  return this.context.chat && this.context.chat.id;
};

module.exports.exit = function exit() {
  this.emit("leave", this.pers_id);
};

module.exports.get_id = function get_id () {
  return this.unique();
};

module.exports.start = function start(p) {
  this.pers_id = p[0];
  this.pers_name = p[1];
  this.pers_color = p[2];
  this.emit("join", [this.pers_id, this.pers_name, this.pers_color]);

  var members = {};
  for (m in this.group) {
    var mem = this.group[m];
    members[mem.pers_id] = [mem.pers_name, mem.pers_color];
  }

  var messages = this.work.db.rows(
    "select pers_id, pers_name, message, datestr as date from (" +
    "select pers_id, pers_name, message" +
    ", date,  to_char(date, 'HH24:MI DD Mon YYYY') as datestr " +
    "from work_chat_messages " +
    "WHERE chat_id=:chat_id ORDER BY date DESC limit 10" +
    ") AS X",
    {chat_id:this.group_id});
  return [members, messages, this.pers_id];
};

module.exports.say = function say(p) {
  var date = this.work.db.only("insert into work_chat_messages" +
    " (chat_id, pers_id, pers_name, message)" +
    " VALUES (:id, :pers_id, :pers_name, :msg)" +
     " returning to_char(date, 'HH24:MI DD Mon YYYY');",
    {id:this.group_id, pers_id:this.pers_id, pers_name:this.pers_name, msg:p});
  this.emit("message", [this.pers_id, this.pers_name, this.pers_color, date, p]);
};
