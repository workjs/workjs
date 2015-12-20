# WorkJS

This is the WorkJS core package.
It replaces the previous WorkJS Core module.
The functionality of several work modules is now contained here.

WorkJS currently provides only a small portion of the functionality planned.
Even so I think it is the first viable WorkJS version which delivers value to its user.

More documentation is included in the quick start demo installation.

# WorkJS Quick Start

WorkJS is a Web Application Framework based on [node.js](https://nodejs.org/)

## Objectives

* Map: a manually written site map defines which url and http method are served and how they are served
* Nonstop: a bug in the application code must not crash the server
* SQL: use PostgreSQL, a technically mature database backend
* Logging: detailed logging - messages, access, debugging with time stamps
* Reload: automatically (watch your files) or manually reload on changes without server restart

WorkJS does not care about old browsers and requires PostgreSQL 9.5!

## Quick Start

### Installation

You need a working node.js installation and npm to install WorkJS.

You also need a PostgreSQL database server (9.5) with a new database.

For a quick start install the WorkJS package and create a boilerplate application.
Edit app.js to match your PostgreSQL server and database name.
Start the application.

~~~bash
[sudo] npm install -g workjs
workjs -c workshop
cd workshop
npm install
vi app.js
npm start
~~~

Direct your browser to port 3000.

## License
MIT
