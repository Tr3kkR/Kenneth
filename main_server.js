const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const routes = require("./routes.js");
const morgan = require("morgan"); //logging module

function initServer() {
  const app = express();
  const serverPort = 3000;

  // Connect to PostgreSQL
  const pool = new Pool({
    user: process.env.DB_USER, //set your environment variables or use Hashi or some other vault
    host: "localhost", 
    database: "postgres",
    password: process.env.DB_PASSWORD, //set your environment variables or use Hashi or some other vault
    port: 5432,
  });

  app.use(morgan("dev")); //set logging type to 'dev'
  app.use(bodyParser.urlencoded({ extended: true })); // Middleware to parse body

  const listen = app.listen(serverPort, () => {
    //start a listener and put it in a listen object for debug
    console.log(`Server running on http://localhost:${serverPort}`);
  });

  routes.initRoutes(app, pool);
  return { app, serverPort, pool };
}

async function main() {
  const { app, serverPort, pool } = initServer();
}

main().then();
