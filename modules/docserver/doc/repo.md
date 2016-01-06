# WorkJS Content Repository

WorkJS manages content like files and folders (others might follow) in a content repository.

### Configuration Options:

**CR Root Directory:** `conf.cr_root = conf.rootdir + "/CR"`
The location of a file system folder where the content files will be stored.

**CR Partition:** `conf.cr_partition = "A"`
Partition is a directory inside the root directory where new content files will be stored.
This allows to extend the repository if the disk fills up without reorganization, 
perhaps even without interruption. Simply mount a new disk at the partition location.

## Properties

### module.work.cr
A content repository initialized with the CR configuration options.
This is the default repository and currently the only one.

### module.work.REPO
The repository constructor. It allows to create additional CRs.

### module.work.cr.stock(file)
### this.cr.stock(file)
Stores a file in work_storage and returns its "id". The file_size and md5 sum of the file are 
used to check if the file was already present and if so the file is not stocked again but the id 
of the avaliable file is returned.

This dow not run in the request transcation, i.e. the file should be stored in the database 
even if the request transaction rolls back.

cr.stock is used by cr.add_file.
You propably will not use it directly.

### this.cr.add_file(file, folder, thumb)
### module.work.cr.add_file(file, folder, thumb)
Put a file into the CR below folder.
The optional thumb can point to an additional file in work_storage 
intended to be used as thumbnail image in an user interface.

cr.add_file runs in the request transaction if called via "this.cr",
but "cr.stock" used in cr.add_file always run in its own transaction.
Therefore a file should always be refered from the work_storage table,
but might not be refered from the work_repo table.

### this.cr.add_folder(name, folder, thumb)
### module.work.cr.add_folder(name, folder, thumb)
Add a new folder to the CR below folder and with optional thumb.

### this.cr.download(item_id)
Download the item (file) stored at item_id.

### this.cr.open(item_id)
Send the item (file) stored at item_id to open in the browser.

### this.cr.send(item_id, disposition)
Send the item (file) stored at item_id to open (disposition = 'inline') or download (disposition = 'attachment');

## Database tables:

### work_storage
Work_storage is an index of the actual locations of the stored files relative to the CR root directory.

### work_repo
work_repo is an index to the files in work_storage. A row in work_repo is an item which can be a file 
(has a reference to work_storage) and / or a folder (has a reference to an other work_repo item.
