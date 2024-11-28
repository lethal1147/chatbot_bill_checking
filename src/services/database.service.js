const sqlite3 = require("sqlite3");
const { generatePublicId } = require("../utils/generateBillPublicId");

// USER
const getUserByLineId = (lineId) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./bill.db");
    db.get("SELECT * FROM tb_user WHERE lineid = ?", [lineId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const checkUserExists = (lineId) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./bill.db");

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

const createUser = (lineId, username) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./bill.db");

    const query = `
            INSERT INTO tb_user (lineid, username, messages)
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

const getUserMessages = (lineid) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./bill.db");
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

const updateUserMessage = (lineId, newMessages) => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = new sqlite3.Database("./bill.db");
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

// BILL
const createBillFromRecognizer = async (
  date = new Date(),
  formRecognizerData
) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./bill.db");
    const billPublicId = generatePublicId(date);
    // Insert the bill into tb_bills with bill_public_id and date (using date as the name)
    const insertBillQuery = `
          INSERT INTO tb_bills (bill_public_id, date, name)
          VALUES (?, ?, ?);
      `;

    db.run(insertBillQuery, [billPublicId, date, date], function (err) {
      if (err) {
        db.close();
        reject("Error inserting bill: " + err);
        return;
      }

      const billId = this.lastID;

      const insertMenuQuery = `
              INSERT INTO tb_bill_menus (name, quantity, price_per_item, bill_id)
              VALUES (?, ?, ?, ?);
          `;

      // example [{"name": "Tori Karaage", "quantity": "2", "netPrice": "196", "pricePerItem": "98"}]
      const menuPromises = formRecognizerData.menus.map((menu) => {
        return new Promise((menuResolve, menuReject) => {
          db.run(
            insertMenuQuery,
            [menu.name, menu.quantity, menu.pricePerItem, billId],
            function (err) {
              if (err) {
                menuReject("Error inserting menu: " + err);
                return;
              }
              menuResolve();
            }
          );
        });
      });

      // After all menus are inserted, resolve the bill creation
      Promise.all(menuPromises)
        .then(() => {
          db.close();
          resolve({ billId, billPublicId, date });
        })
        .catch((err) => {
          db.close();
          reject(err);
        });
    });
  });
};

const checkMenusInBill = async (billPublicId) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./bill.db");

    // Query to get bill data by billPublicId
    const getBillQuery = `
          SELECT id, bill_public_id, date, name
          FROM tb_bills
          WHERE bill_public_id = ?;
      `;

    db.get(getBillQuery, [billPublicId], (err, billData) => {
      if (err) {
        db.close();
        reject("Error fetching bill data: " + err);
        return;
      }

      if (!billData) {
        db.close();
        reject("No bill found with the provided bill public ID.");
        return;
      }

      // Query to get menu items for the bill
      const getMenuQuery = `
              SELECT name, quantity, price_per_item
              FROM tb_bill_menus
              WHERE bill_id = ?;
          `;

      db.all(getMenuQuery, [billData.id], (err, menuData) => {
        db.close();
        if (err) {
          reject("Error fetching menu data: " + err);
          return;
        }

        // Format the bill and menu data as a string
        if (menuData && menuData.length > 0) {
          let formattedMessage = `Bill: ${billData.name} (${billData.date})\n\nMenu:\n`;

          menuData.forEach((menu, index) => {
            formattedMessage += `${index + 1}. ${menu.name} (x${
              menu.quantity
            }) - ${menu.price_per_item} each\n`;
          });

          // Return the formatted message for ChatGPT API
          resolve(formattedMessage);
        } else {
          resolve(
            `No menu items found for the bill: ${billData.name} (${billData.date})`
          );
        }
      });
    });
  });
};

module.exports = {
  getUserByLineId,
  checkUserExists,
  createUser,
  getUserMessages,
  updateUserMessage,
  createBillFromRecognizer,
  checkMenusInBill,
};
