<h1>WorkJS - Utilities</h1>

### w.conf
### this.conf

The WorkJS configuration.

### w.unique()
### this.unique()
create unique ID from Date.now

### w.sleep(ms)
### this.sleep(ms)
syncho sleep

### w.lastID
last unique ID created

### this.end()
finalize request, reply my body.

### this.reply3xx(code, location)
reply a "3xx" redirect response to "location".

### this.reply4xx(code, message)
throw a "4xx" error with "message"

### this.reply5xx(code, message)
throw a "5xx" error with "message"

### this.throwError(err)
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

### w.randomStringAsBase64Url(size)
### this.randomStringAsBase64Url(size)
http://stackoverflow.com/questions/8855687/secure-random-token-in-node-js/25690754#25690754<br>
Generate a random Base64 encoded string.<br>
Size is the unencoded size, therefore the returned string will be longer.

### w.dependencies
WorkJS imports several node and external modules and attaches them to the work object:
crypto cookies bcrypt base64url syncho

## Work Object Inspector
Inspect object with the browser.
Requires JQuery and work-util.css and work-util.js.

Usage example:
JQuery is loaded in master.html
"r" is the object to enspect



~~~html
{% extends "master.html" %}

{% block head %}
<link href="/static/work-util.css" media="all" rel="stylesheet" type="text/css" />
<script src="/static/work-util.js"></script>

<script>
$(function() { work_inspect("#obj", {{ r|safe }}); });
</script>
{% endblock %}

{% block content %}
...
<div id="obj"></div>
...
{% endblock %}
~~~
