CREATE TABLE tb_bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_public_id TEXT NOT NULL UNIQUE,
    date DATETIME NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE tb_bill_menus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price_per_item INTEGER NOT NULL,
    bill_id INTEGER NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES tb_bills(id) ON DELETE CASCADE
);

CREATE TABLE tb_bill_member (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    bill_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'idle',
    total INTEGER NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES tb_bills(id) ON DELETE CASCADE
);

CREATE TABLE tb_user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lineid TEXT NOT NULL,
    username TEXT NOT NULL,
    messages JSON
)