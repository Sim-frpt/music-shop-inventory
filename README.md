# music-shop-inventory

This is a basic Express application project taken from [the Odin Project](https://www.theodinproject.com).  
The goal was to deploy a basic inventory app that would allow CRUD operations on two basic DB tables.
You can see a live version thanks to Heroku [here](https://agile-springs-42318.herokuapp.com/inventory/)

The technologies used are:
* Node -> Express framework
* PostgreSQL as a DB, with [node-postgres](https://node-postgres.com/) as an interface
* [Handlebars JS](https://handlebarsjs.com/) as a templating language
* [Express-validator](https://express-validator.github.io/) and [Multer](https://github.com/expressjs/multer) as the main Express modules, respectively for validating and sanitizing inputs, and deal with file uploads.
* Heroku as a free hosting solution

### To run this locally:
* Clone this repo
* install dependencies with npm
* Provide authentication to a local Postgres DB via the following config vars:
  * DB_USER
  * DB_HOST
  * DB_DATABASE(name of the DB)
  * DB_PASSWORD
  * DB_PORT
* Run the sql scripts located in *db/* subfolder to create the appropriate tables and populate them with data. Start with `create-tables.sql`, then `sample-data.sql`
* run Nodemon with DEBUG config var via the script `devstart` => `npm run devstart`
* Port is 3000 by default
