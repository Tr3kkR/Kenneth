//define middleware chain - > auth then pass to the appropriate route?

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
        console.log(res.locals.b64_auth_value);
        console.log("http basic auth");
      } 
      else {
        return res.status(403).json({ error: "Invalid header" });
      }

      res.locals.check = (await pool.query("SELECT * FROM role")).rows;
      let match = false;

      for ({ id, name } of res.locals.check) {
        const userPassString = id + ":" + name;
        const b_64 = Buffer.from(userPassString).toString("base64");
        if (res.locals.b64_auth_value == b_64) {
          match = true;
          console.log("Valid credentials: user authenticated");
          next();
        }
      }
      if (!match) {
        return res.status(403).json({ error: "Invalid Credentials" });
      }
}

  //chuck all the app.gets in here

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
