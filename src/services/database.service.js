const sqlite3 = require("sqlite3");

const dbPath = "../../bill.db";

export const getUserByLineId = (lineId) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    db.get("SELECT * FROM tb_user WHERE lineid = ?", [lineId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

export const checkUserExists = (lineId) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);

    const query = `
            SELECT COUNT(*) AS count FROM tb_user
            WHERE lineid = ?;
        `;

    db.get(query, [lineId], (err, row) => {
      db.close();
      if (err) {
        reject(err);
        return;
      }
      resolve(row.count > 0);
    });
  });
};

export const createUser = (lineId, username) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);

    const query = `
            INSERT INTO tb_user (lineid, username, message)
            VALUES (?, ?, ?);
        `;

    db.run(query, [lineId, username, JSON.stringify([])], function (err) {
      db.close();
      if (err) {
        reject(err);
        return;
      }
      resolve({ error: false, message: "User created." });
    });
  });
};

export const getUserMessages = (lineid) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    const query = `
            SELECT messages FROM tb_user
            WHERE lineid = ?;
        `;

    db.get(query, [lineid], (err, row) => {
      db.close();
      if (err) {
        reject(err);
        return;
      }
      if (row) {
        resolve(JSON.parse(row.messages));
      } else {
        resolve({ error: true, message: "User not found." });
      }
    });
  });
};

export const updateUserMessage = (lineId, newMessages) => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = new sqlite3.Database(dbPath);
      const query = `
        UPDATE tb_user
        SET messages = ?
        WHERE lineid = ?
      `;
      db.run(query, [JSON.stringify(newMessages), lineId], function (err) {
        db.close();
        if (err) {
          reject(err);
          return;
        }
        resolve({ error: false, message: "User message updated." });
      });
    } catch (err) {
      reject(err);
    }
  });
};
