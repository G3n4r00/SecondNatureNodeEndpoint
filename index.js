const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());

const dbPath = path.resolve("/var/lib/sqlite/mydb.sqlite");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening DB:", err.message);
  } else {
    console.log("Connected to SQLite DB.");
  }
});

// Create USERS se nao existir
db.run(`
  CREATE TABLE IF NOT EXISTS USERS (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    UF TEXT NOT NULL,
    cpf TEXT NOT NULL,
    dt_nasc TEXT,
    genero TEXT,
    profissao TEXT
  )
`);


//Insert user
app.post("/users", (req, res) => {
  const { nome, email, UF, cpf, dt_nasc, genero, profissao } = req.body;

  if (!nome || !email || !UF || !cpf) {
    return res.status(400).json({ error: "nome, email, UF and cpf são necessários" });
  }

  const sql = `
    INSERT INTO USERS (nome, email, UF, cpf, dt_nasc, genero, profissao)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [nome, email, UF, cpf, dt_nasc, genero, profissao], function (err) {
    if (err) {
      console.error("Erro ao inserir usuário:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({
      id: this.lastID,
      nome,
      email,
      UF,
      cpf,
      dt_nasc,
      genero,
      profissao
    });
  });
});

// GET all users
app.get("/users", (req, res) => {
  const sql = "SELECT * FROM USERS";
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Error fetching users:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
