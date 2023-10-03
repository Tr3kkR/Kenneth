async function initRoutes(app, pool) {
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

  // Handle form submission
  app.post("/submit", async function (req, res) {

    try {
      if (req.body.data) {
        await pool.query("INSERT INTO form_data (data) VALUES ($1)", [req.body.data])
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
