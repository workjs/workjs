
w.db.query("create table IF NOT EXISTS work_chat (" +
  "chat_id serial PRIMARY KEY" +
  ",key text UNIQUE" +
  ",title text" +
  ",code text" +
  ",creation timestamptz DEFAULT now() );" );

w.db.query("create table IF NOT EXISTS work_chat_messages (" +
  "chat_id int REFERENCES work_chat (chat_id) ON DELETE CASCADE" +
  ",pers_id bigint" +
  ",pers_name text" +
  ",message text" +
  ",date timestamptz DEFAULT now() );" );

//create WS cache

w.cache.chat_groups = {};
w.cache.chat_members = {};

w.module("chat", `Simple websocket based chat example`);
w.chat = {};

w.chat.get_group = function get_group(key) {
  if (!w.cache.chat_groups[key]) w.cache.chat_groups[key] =
    w.db.one("select chat_id as id, title, " +
      "to_char(creation, 'YYYY-MM-DD HH24:MI') as creation " +
      "FROM work_chat WHERE key=:key", {key:key});
  return w.cache.chat_groups[key]
};
