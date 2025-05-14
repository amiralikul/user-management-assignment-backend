import Database from 'better-sqlite3';

const db = new Database('data.db');

// Create the users table if it doesn't exist
db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    age INTEGER NOT NULL
);
`);

// Seed some sample data if the table is empty
const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
if (userCount === 0) {
    const insert = db.prepare('INSERT INTO users (name, email, age) VALUES (?, ?, ?)');
    for (let i = 1; i <= 50; i++) {
        insert.run(`User ${i}`, `user${i}@example.com`, 20 + (i % 10));
    }
}

export default db;
