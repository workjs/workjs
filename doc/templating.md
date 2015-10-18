# WorkJS - Templating

WorkJS uses the [Nunjucks](https://mozilla.github.io/nunjucks/) rich and powerful templating language for JavaScript.

WorkJS template files are named with the http method (verb) as file extension.
e.g. "myPage.get" or "myPage.post"

The templates optionally extend a layout (master) template from a folder with name "LAYOUT".

All values a handler function stores in "this.context" object are avaliable in the template.


Example: www/home.js
~~~
module.exports.get = function get(next) {
  this.context.title = "Home Page Title";
  next();
};
~~~

You must call next() in the handler function to render a template!

Example: www/home.get
~~~html
{% extends "master.html" %}

{% block content %}
<h1>{{title}}</h1>
{% endblock %}
~~~
   
Example: LAYOUT/master.html
~~~html
<!DOCTYPE html>
<html>
<head>
  <link href="/static/app.css" media="all" rel="stylesheet" type="text/css" />
</head>
<body>
<div class='menu'>...</div>
{% block content %}{% endblock %}
...
</body>
</html>
~~~

