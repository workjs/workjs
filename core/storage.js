
var w = module.work;

/*
drop table files cascade ;
*/

w.db.query("create table IF NOT EXISTS files (" +
  "file_id serial PRIMARY KEY, " +
  "file_size int, " +
  "md5 text, " +
  "transferEncoding text, " +
  "mimeType text, " +
  "location text, " +
  "refcount int DEFAULT 0, " +
  "creation timestamptz DEFAULT now(), " +
  "UNIQUE(file_size, md5));" );

