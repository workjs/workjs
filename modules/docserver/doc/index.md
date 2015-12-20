# WorkJS Quick Start

WorkJS is a Web Application Framework based on [node.js](https://nodejs.org/)
It uses html5 features and does *not* care to support old web clients.

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

You also need a PostgreSQL database server (9.5 or newer :-) with a new database.
We use PostgreSQL 9.5 as it now provides features like "INSERT ON CONFLICT DO UPDATE" and "CREATE INDEX IF NOT EXISTS".
PostgreSQL installation: http://www.postgresql.org/download/linux/
How to install PostgreSQL 9.5 on Ubuntu/Debian/Linux Mint: http://raonyguimaraes.com/installing-postgresql-9-5-on-linux/

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
