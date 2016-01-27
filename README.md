# WorkJS Quick Start

WorkJS is a Web Application Framework with WebSocket support based on [node.js](https://nodejs.org/)
It uses html5 features and does *not* care to support old web clients.

## Objectives

* The Map: write a site map to define how urls and http methods are served.
* Nonstop: a bug in the application code must not crash the server.
* SQL: use PostgreSQL, a technically mature database backend.
* Logging: detailed logging - messages, access, debugging with time stamps.
* Reload: automatically (watch your files) or manually reload on changes without server restart.
* WebSockets: a WorkJS application can be constructed from multiple WebSocket based singel page applications.

### Basic Conditions
* WorkJS does not care about old browsers.
* WorkJS does not care about backwards compatibility.
* WorkJS requires the newest components - e.g. PostgreSQL 9.5
* WorkJS is built for Linux.

## Quick Start

### Installation

You need a working node.js installation and npm to install WorkJS.

You also need a PostgreSQL database server (9.5) with a new database.
We use PostgreSQL 9.5 as it now provides features like "INSERT ON CONFLICT DO UPDATE" and "CREATE INDEX IF NOT EXISTS".
PostgreSQL installation: http://www.postgresql.org/download/linux/
How to install PostgreSQL 9.5 on Ubuntu/Debian/Linux Mint: http://raonyguimaraes.com/installing-postgresql-9-5-on-linux/

For a quick start install the WorkJS package and start the "workshow" demo application.
Edit CONF to match your PostgreSQL server and database name.
Start the application.

~~~bash
[sudo] npm cache clean
[sudo] npm install -g workjs
workjs -c workshop
cd workshop
vi CONF
npm install
npm start
~~~

Direct your browser to port 3000.

## License
MIT
