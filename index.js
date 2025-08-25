const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(bodyParser.json());

// Connect to SQLite DB (stored in /var/lib/sqlite/mydb.sqlite)
const db = new sqlite3.Database("/var/lib/sqlite/mydb.sqlite", (err) => {
  if (err) {
    console.error("Error opening DB:", err.message);
  } else {
    console.log("Connected to SQLite DB.");
  }
});

//Insert user
app.post("/users", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email required" });
  }

  const stmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
  stmt.run([name, email], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, name, email });
  });
  stmt.finalize();
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
