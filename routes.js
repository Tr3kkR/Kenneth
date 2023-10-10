var crypto = require('crypto');

async function initRoutes(app, pool) {

  async function basicAuthUser(req, res, next) { 
    // common auth function
    // use http basic auth
    // creds in db row
    // cr = client request

    if (!req.headers.authorization) {
      return res.status(401).json({ error: "Null request auth header" }); //TO FIX: confirm response code
    }

    const auth_header = req.headers.authorization;
    const regex = new RegExp("Basic\\s+(.*)$");
    const cr_b64_decoded = new Buffer.from(auth_header.split(' ')[1],'base64').toString().split(':');
    const [cr_user, cr_password] = cr_b64_decoded


    if (!auth_header.match(regex)) {
      res.setHeader('WWW-Authenticate', 'Basic')
      return res.status(403).json({ error: "Invalid auth header" }); //TO FIX: confirm response code
    }
      
    if (!cr_user || !cr_password) {
      res.setHeader('WWW-Authenticate', 'Basic')
      return res.status(401).json({ error: "Invalid creds" }); //TO FIX: confirm response code
    }
    
    var db_query_result = undefined

    try {
      db_query_result = (await pool.query(`SELECT name,hash,salt FROM role WHERE name = \'${cr_user}\'`)).rows
      
      if (db_query_result.length == 0) {
        res.setHeader('WWW-Authenticate', 'Basic')
        return res.status(401).json({error: "Unauthorized" }); //TO FIX: confirm response code
      }

      if (db_query_result.length > 1) {
        //this should violate the db constraints anyway
        throw error('More than one matching user returned')
      }
      db_query_result = db_query_result[0]
    }
    catch (err) {
      console.log(err)
      res.setHeader('WWW-Authenticate', 'Basic')
      return res.status(500).json({error: "Unknown Internal Error" });
    }

    const { name, hash, salt } = db_query_result

    if (!(name == cr_user)) {
      res.setHeader('WWW-Authenticate', 'Basic')
      return res.status(500).json({error: "Unknown Internal error" })
    }
    
    const cr_hashed_password = crypto.pbkdf2Sync(cr_password, salt, 100000, 64, 'sha512').toString('hex') //using pbkdf2 as password hash function

    if (!(cr_hashed_password == hash)) {
      res.setHeader('WWW-Authenticate', 'Basic')
      return res.status(401).json({ error: "Invalid Credentials" })
    }

    console.log(`HTTP basic Auth. Valid credentials: user \'${name}\' authenticated`);
    res.locals.check = db_query_result
    next(); //user authenticated
}

  // Begin route list
  app.get("/", (req, res) => {
    const formHTML = `
            <form action="/submit" method="post">
                <label for="data">Enter Data:</label>
                <input type="text" name="data" required>
                <button type="submit">Submit</button>
            </form>
        `;
    res.send(formHTML);
  });

  app.get("/readroles", basicAuthUser, async function (req, res) {
      res.setHeader("content-type", "application/json");
      res.status(200).send(res.locals.check);
  });

  // Handle form submission
  app.post("/submit", basicAuthUser,  async function (req, res) {
    try {
      if (req.body.data) {
        await pool.query("INSERT INTO form_data (data) VALUES ($1)", [
          req.body.data,
        ]);
        res.send("Data saved successfully!");
      } else {
        res.status(400).send("Missing request body");
      }
    } catch (err) {
      //console.error(err);
      res.status(500).send("An error occurred while saving data.");
    }
  });

  app.get("/helloworld", async function (req, res) {
    res.send("hello world");
  });

  app.use((req, res) => {
    //fallback
    res.status(404).send("Sorry can't find that!");
  });
}

module.exports = { initRoutes };
