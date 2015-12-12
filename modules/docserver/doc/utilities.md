<h1>WorkJS - Utilities</h1>

### work.conf
### this.conf

The WorkJS configuration.

### work.unique()
### this.unique()
create unique ID from Date.now

### work.sleep(ms)
### this.sleep(ms)
syncho sleep

### work.lastID
last unique ID created

### this.end()
finalize request, reply my body.

### this.reply303(location)
reply a "303" redirect response to "location".

### this.reply404(message)
throw a "404" error with "message"

### this.reply500(message)
throw a "500" error with "message"

### this.replyError(err)
throw Error "err"

### this.sendFile(root, path, done)
Uses [send](https://github.com/pillarjs/send) to stream a file from the file system.
Async send file "path" from folder "root".

### this.sendFileSync(root, path)
Sync version of sendFile
Used to deliver static files with the /static/* wildcard route.

### this.parseForm()
%%%

### this.parseFormSync()
%%%

### this.marked(md)
Uses [marked](https://github.com/chjj/marked) to convert markdown "md" to html.
Used to render this dokumentation with the www/docserver handler.

### work.randomStringAsBase64Url(size)
### this.randomStringAsBase64Url(size)
http://stackoverflow.com/questions/8855687/secure-random-token-in-node-js/25690754#25690754<br>
Generate a random Base64 encoded string.<br>
Size is the unencoded size, therefore the returned string will be longer.

### work.dependencies
WorkJS imports several node and external modules and attaches them to the work object:
crypto cookies bcrypt base64url syncho

