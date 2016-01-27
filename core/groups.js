require('./auth.js');
var w = module.work;

/*
drop table work_groups cascade;
drop table work_group_members cascade;
drop table work_group_admins cascade;
*/

w.db.query("create table IF NOT EXISTS work_groups (" +
  "group_id serial PRIMARY KEY" +
  ",name text" +
  ",supergroup int REFERENCES work_groups (group_id) ON DELETE CASCADE" +
  ",creation timestamptz DEFAULT now()" +
  ",rootfolder int REFERENCES work_repo (item_id) ON DELETE SET NULL);" );

w.db.query("create table IF NOT EXISTS work_group_members (" +
  "group_id int REFERENCES work_groups (group_id) ON DELETE CASCADE" +
  ",user_id int REFERENCES work_users (user_id) ON DELETE CASCADE" +
  ",creation timestamptz DEFAULT now()" +
  ",CONSTRAINT work_group_members_group_id_user_id_key UNIQUE (group_id, user_id));" );

w.db.query("create table IF NOT EXISTS work_group_admins (" +
  "group_id int REFERENCES work_groups (group_id) ON DELETE CASCADE" +
  ",user_id int REFERENCES work_users (user_id) ON DELETE CASCADE" +
  ",creation timestamptz DEFAULT now()" +
  ",CONSTRAINT work_group_admins_group_id_user_id_key UNIQUE (group_id, user_id));" );

