const sqlite3 = require("sqlite3").verbose();
const fs = require("fs").promises;
const path = require("path");

const dbPath = path.join(__dirname, "bill.db");
const schemaPath = path.join(__dirname, "database", "initial_db.sql");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err);
    return;
  }
  console.log("Connected to SQLite database");
  initializeDatabase();
});

async function initializeDatabase() {
  try {
    // Read SQL files
    const createTableSQL = await fs.readFile(schemaPath, "utf8");
    // Enable foreign keys
    db.run("PRAGMA foreign_keys = ON");

    // Run initialization in a transaction
    db.serialize(() => {
      // Begin transaction
      db.run("BEGIN TRANSACTION");

      try {
        // Create tables
        db.exec(createTableSQL, (err) => {
          if (err) {
            console.error("Error creating tables:", err);
            db.run("ROLLBACK");
            return;
          }

          db.run("COMMIT");
          console.log("Database initialization completed");
        });
      } catch (error) {
        console.error("Error during database initialization:", error);
        db.run("ROLLBACK");
      }
    });
  } catch (error) {
    console.error("Error reading SQL files:", error);
  }
}

// Handle process termination
process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err);
    } else {
      console.log("Database connection closed");
    }
    process.exit();
  });
});
