var crypto = require('crypto');

async function initRoutes(app, pool) {

  async function basicAuthUser(req, res, next) { 
    // common auth function
    // use http basic auth
    // creds in db row
      if (!req.headers.authorization) {
        return res.status(403).json({ error: "No credentials sent!" });
      }
      
      const auth_header = req.headers.authorization;
      const regex = new RegExp("Basic\\s+(.*)$");
      
      if (auth_header.match(regex)) {
        
        res.locals.b64_auth_value = auth_header.match(regex)[1];
        const b_64_decoded = (Buffer.from(res.locals.b64_auth_value, 'base64').toString('ascii')).split(':') //TO FIX: need more accurate splitting
        const [user, password_hash] = b_64_decoded //TO FIX: hashed password
        res.locals.user = user
        res.locals.password_hash = password_hash

        console.log(res.locals.b64_auth_value);
        console.log("http basic auth");
      } 
      else {
        return res.status(403).json({ error: "Invalid header" });
      }

      res.locals.check = (await pool.query("SELECT * FROM role")).rows; //TO FIX: need to search for actual user instead
      let match = false;

      for ({ id, name, hash } of res.locals.check) {
        if (name == res.locals.user) {
          if (res.locals.password_hash == hash) {
            match = true
            console.log("Valid credentials: user authenticated");
            next(); //user authenticated
          }
          }
        }
      if (!match) {
        return res.status(403).json({ error: "Invalid Credentials" });
      }
}

  // Serve a simple form on the root route
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
