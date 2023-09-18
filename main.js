const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// Connect to PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER, //set your environment variables or use Hashi or some other vault
    host: 'localhost', //Assumes
    database: 'your_database_name',
    password: process.env.DB_PASSWORD, //set your environment variables or use Hashi or some other vault
    port: 5432,
});

// Middleware to parse POST data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve a simple form on the root route
app.get('/', (req, res) => {
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
app.post('/submit', async (req, res) => {
    try {
        const data = req.body.data;
        await pool.query('INSERT INTO form_data (data) VALUES ($1)', [data]);
        res.send('Data saved successfully!');
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while saving data.');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
