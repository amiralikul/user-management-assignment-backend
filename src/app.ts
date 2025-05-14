import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import db from './database';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());


// Fetch all users
app.post('/users', (req, res) => {
    const { page = 0, pageSize = 10 } = req.body;
    const offset = page * pageSize;

    const totalUsersStmt = db.prepare('SELECT COUNT(*) as count FROM users');
    const { count: totalUsers } = totalUsersStmt.get() as { count: number };

    const totalPages = Math.ceil(totalUsers / pageSize);

    const stmt = db.prepare(`
        SELECT * FROM users
        LIMIT ? OFFSET ?
    `);
    const users = stmt.all(pageSize, offset);
    res.json({ users, totalPages });
});

// Fetch a list of users matching the search query
app.post('/users/search', (req, res) => {
    const { filter, page = 0, pageSize = 10 } = req.body;
    const nameFilter = filter?.name || '';
    const offset = page * pageSize;

    const totalMatchingUsersStmt = db.prepare(`
        SELECT COUNT(*) as count FROM users 
        WHERE name LIKE ?
    `);
    const { count: totalMatchingUsers } = totalMatchingUsersStmt.get(`%${nameFilter}%`) as { count: number };

    const totalPages = Math.ceil(totalMatchingUsers / pageSize);

    const stmt = db.prepare(`
        SELECT * FROM users 
        WHERE name LIKE ? 
        LIMIT ? OFFSET ?
    `);

    const users = stmt.all(`%${nameFilter}%`, pageSize, offset);
    res.json({ users, totalPages });
});

// Fetch detailed information for a specific user
app.get('/users/:id', (req, res) => {
    const { id } = req.params;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);

    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

