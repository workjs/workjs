
require('./auth.js');

/*
drop table work_repo cascade ;
drop table work_storage cascade ;
*/

w.db.query("create table IF NOT EXISTS work_storage (" +
  "stock_id serial PRIMARY KEY" +
  ",file_size int" +
  ",md5 text" +
  ",location text" +
  ",UNIQUE(file_size, md5));" );

w.db.query("create table IF NOT EXISTS work_repo (" +
  "item_id serial PRIMARY KEY" +
  ",name text" +
  ",mimeType text" +
  ",stock_id int REFERENCES work_storage (stock_id)" +
  ",folder int REFERENCES work_repo ON DELETE CASCADE" +
  ",creation timestamptz DEFAULT now()" +
  ",modification timestamptz DEFAULT now()" +
  ",thumb int REFERENCES work_storage (stock_id));" );

w.REPO = function repo(cr_root, cr_partition) {
  this.cr_root = cr_root;
  this.cr_partition = cr_partition;

  var cr_path = cr_root + '/' + cr_partition + '/';
  w.dep.mkdirp.sync(cr_path, null);
  var cr = this;
  
  //put a single file into the content store
  //here we use the global (w) context, as we want this to be done 
  //even if the request transaction rolls back
  this.stock = function stock(file) {
    var d = new Date();
    var datepart = d.getFullYear()+"/"+(d.getMonth()+1)+"/"+d.getDate()+"/";
    var cr_location = this.cr_partition + '/' + datepart + file.file_id;
    w.dep.mkdirp.sync(cr_path + datepart);
    
    //first check if file already present in store
    var stock_id = w.db.only("select stock_id from work_storage " +
      "WHERE file_size = :file_size AND md5 = :md5;",
      {file_size:file.size, md5:file.md5});
    if (stock_id) {
      //discard the new copy
      w.dep.fs.unlinkSync(file.path); }
    else {
      //move new file into store
      stock_id = w.db.only("insert into work_storage (file_size, md5, location) " +
        "VALUES (:file_size, :md5, :location) " +
        "RETURNING stock_id;",
        {file_size:file.size, md5:file.md5, location:cr_location});
      w.dep.fs.renameSync(file.path, cr_path + datepart + file.file_id);
    };

    return stock_id
  };

  //put a single file into the content repository
  this.add_file = function add_file(file, folder, thumb) {
    var stock_id = cr.stock(file);
    
    return this.ctx.db.only("insert into work_repo (name, mimeType, stock_id, folder, thumb) " +
      "VALUES (:name, :mime, :stock_id, :folder, :thumb) " +
      "RETURNING item_id;",
      {name:file.filename, mime:file.mimetype, stock_id:stock_id, folder:folder, thumb:thumb});
  };
  
  this.add_folder = function add_folder(name, folder, thumb) {
    return this.ctx.db.only("insert into work_repo (name, folder, thumb) " +
      "VALUES (:name, :folder, :thumb) RETURNING item_id;",
      {name:name, folder:folder, thumb:thumb});
  };
  
  //send item to the request connection, only sensible in request context
  this.send = function send(item_id, disposition) {
    var item = this.ctx.db.one("select s.location, r.name, r.mimetype " +
      "from work_storage s, work_repo r " +
      "where r.item_id=:item_id and r.stock_id = s.stock_id",
      {item_id:item_id});
    this.ctx.res.setHeader('Content-type', item.mimetype);
    this.ctx.res.setHeader('Content-disposition', disposition+'; filename=' + item.name);
    this.ctx.sendFileSync(w.cr.cr_root, item.location);
  };
  
  this.download = function download(item_id) {
    this.send(item_id, "attachment");
  };
  
  this.open = function open(item_id) {
    this.send(item_id, "inline");
  };
};

//cr in the request context or the global work context
w.crx = function crx(ctx) {
  this.ctx = ctx;
};
w.crx.prototype = new w.REPO(w.conf.cr_root, w.conf.cr_partition);

//create the cr in global work context
w.cr = new w.crx(w);


//Object.defineProperty(Work.prototype, "cr", {get: function() { return new w.crx(this); }});
