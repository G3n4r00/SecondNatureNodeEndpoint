const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '5mb' }));

// =================================================================
// 1. Parte Logger
// =================================================================
const logDirectory = '/var/log/my-app';

// Garantir que o arquivo de log realmente existe
if (!fs.existsSync(logDirectory)) {
    try {
        fs.mkdirSync(logDirectory, { recursive: true });
    } catch (err) {
        console.error('CRITICAL: Could not create log directory. Exiting.', err);
        process.exit(1);
    }
}

const accessLogPath = path.join(logDirectory, 'xp_access.log');
const operationsLogPath = path.join(logDirectory, 'xp_operations.log');
const processLogPath = path.join(logDirectory, 'api_process.log');


const streamOptions = { flags: 'a' };
const accessLogStream = fs.createWriteStream(accessLogPath, streamOptions);
const operationsLogStream = fs.createWriteStream(operationsLogPath, streamOptions);
const processLogStream = fs.createWriteStream(processLogPath, streamOptions);

const logStreams = {
    access: accessLogStream,
    operations: operationsLogStream,
};

// Helper for logging the server's own internal events
const logToServerProcess = (message, level = 'INFO') => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] - ${message}\n`;
    console.log(logMessage.trim()); // Keep console output for real-time monitoring
    processLogStream.write(logMessage);
};

// =================================================================
// 2. DATABASE SETUP
// =================================================================
const dbPath = path.resolve("/var/lib/sqlite/mydb.sqlite");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        logToServerProcess(`Error opening database: ${err.message}`, 'ERROR');
    } else {
        logToServerProcess("Connected to SQLite database successfully.");
    }
});

//Cria se não existir a tabela USERS
db.run(`
  CREATE TABLE IF NOT EXISTS USERS (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    ultimo_nome TEXT NOT NULL,
    email TEXT NOT NULL,
    celular TEXT NOT NULL,
    UF TEXT NOT NULL,
    cpf TEXT NOT NULL,
    dt_nasc TEXT,
    genero TEXT,
    profissao TEXT
  )
`);

// =================================================================
// 3. API ENDPOINTS
// =================================================================

// Logging endpoint
app.post("/api/logs", (req, res) => {
    const { logType, logs } = req.body;

    if (!logType || !logStreams[logType]) {
        return res.status(400).json({ error: "Inválido ou incompleto: 'logType'. Deve ser 'access' ou 'operations'." });
    }
    if (!Array.isArray(logs) || logs.length === 0) {
        return res.status(400).json({ error: "Inválido ou vazio: 'log' array." });
    }

    const selectedStream = logStreams[logType];
    try {
        logs.forEach(logEntry => {
            const { timestamp, level = 'INFO', userId = 'ANONYMOUS', message = '', deviceInfo = {}, metadata = {} } = logEntry;
            const deviceString = deviceInfo.os ? `[${deviceInfo.os} ${deviceInfo.osVersion || ''}]` : '';
            const metadataString = Object.keys(metadata).length > 0 ? `| ${JSON.stringify(metadata)}` : '';
            const formattedLog = `[${timestamp}] [${level.toUpperCase()}] [${userId}] ${deviceString} - ${message} ${metadataString}\n`;
            selectedStream.write(formattedLog);
        });
        res.status(202).send(); // Acknowledge receipt
    } catch (error) {
        logToServerProcess(`Failed to write to log file: ${logType}.log. Error: ${error.message}`, 'ERROR');
        res.status(500).json({ error: 'Internal Server Error: Could not write logs.' });
    }
});

// Insert user
app.post("/users", (req, res) => {
    const { nome, ultimo_nome, email, celular, UF, cpf, dt_nasc, genero, profissao } = req.body;

    if (!nome || !ultimo_nome || !email || !UF || !cpf) {
        return res.status(400).json({ error: "nome, ultimo_nome, email, celular, UF and cpf são necessários" });
    }

    const sql = `
        INSERT INTO USERS (nome, ultimo_nome, email, celular, UF, cpf, dt_nasc, genero, profissao)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [nome, ultimo_nome, email, celular, UF, cpf, dt_nasc, genero, profissao], function (err) {
        if (err) {
            logToServerProcess(`Error inserting user: ${err.message}`, 'ERROR');
            return res.status(500).json({ error: err.message });
        }
        
        const opTimestamp = new Date().toISOString();
        const opLog = `[${opTimestamp}] [INFO] [SYSTEM] - Operation: User created | metadata: ${JSON.stringify({ newUserId: this.lastID, name: `${nome} ${ultimo_nome}` })}\n`;
        operationsLogStream.write(opLog);

        res.json({
            id: this.lastID,
            nome,
            ultimo_nome,
            email,
            celular,
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
            logToServerProcess(`Error fetching users: ${err.message}`, 'ERROR');
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// =================================================================
// 4. INICIAR SERVER E DESLIGAR
// =================================================================
app.listen(PORT, () => {
    logToServerProcess(`Server running on port ${PORT}`);
});

process.on('SIGINT', () => {
    logToServerProcess('Server shutting down.', 'INFO');
    accessLogStream.end();
    operationsLogStream.end();
    processLogStream.end();
    db.close();
    process.exit(0);
});
