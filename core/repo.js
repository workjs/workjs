var mkdirp = module.require('mkdirp');
var fs = require('fs');

require('./auth.js');
var w = module.work;

/*
drop table work_repo cascade ;
drop table work_storage cascade ;
*/

w.db.query("create table IF NOT EXISTS work_storage (" +
  "stock_id serial PRIMARY KEY, " +
  "file_size int, " +
  "md5 text, " +
  "location text, " +
  "UNIQUE(file_size, md5));" );

w.db.query("create table IF NOT EXISTS work_repo (" +
  "item_id serial PRIMARY KEY, " +
  "name text, " +
  "mimeType text, " +
  "stock_id int REFERENCES work_storage (stock_id), " +
  "folder int REFERENCES work_repo ON DELETE CASCADE, " +
  "creation timestamptz DEFAULT now(), " +
  "modification timestamptz DEFAULT now(), " +
  "thumb int REFERENCES work_storage (stock_id));" );

function repo(cr_root, cr_partition) {
  this.cr_root = cr_root;
  this.cr_partition = cr_partition;

  var cr_path = cr_root + '/' + cr_partition + '/';
  mkdirp.sync(cr_path, null);
  var cr = this;
  
  //put a single file into the content store
  this.stock = function stock(file) {
    var d = new Date();
    var datepart = d.getFullYear()+"/"+(d.getMonth()+1)+"/"+d.getDate()+"/";
    var cr_location = this.cr_partition + '/' + datepart + file.file_id;
    mkdirp.sync(cr_path + datepart);
    
    //first check if file already present in store
    var stock_id = w.db.only("select stock_id from work_storage " +
      "WHERE file_size = :file_size AND md5 = :md5;",
      {file_size:file.size, md5:file.md5});
    if (stock_id) {
      //discard the new copy
      fs.unlinkSync(file.path); }
    else {
      //move new file into store
      stock_id = w.db.only("insert into work_storage (file_size, md5, location) " +
        "VALUES (:file_size, :md5, :location) " +
        "RETURNING stock_id;",
        {file_size:file.size, md5:file.md5, location:cr_location});
      fs.renameSync(file.path, cr_path + datepart + file.file_id);
    };

    return stock_id
  };

  //put a single file into the content repository
  this.add = function add(file, folder, thumb) {
    var stock_id = cr.stock(file);
    
    //if (!thumb) { thumb = null; }
    return w.db.only("insert into work_repo (name, mimeType, stock_id, folder, thumb) " +
      "VALUES (:name, :mime, :stock_id, :folder, :thumb) " +
      "RETURNING item_id;",
      {name:file.filename, mime:file.mimetype, stock_id:stock_id, folder:folder, thumb:thumb});
  };

};

w.cr = new repo(w.conf.cr_root, w.conf.cr_partition);
w.REPO = repo;
