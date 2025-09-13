const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const connection = require('./db');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Handle AJAX user submission
app.post('/add-user', (req, res) => {
    const { name, email, password } = req.body;
    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    connection.query(query, [name, email, password], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).send('Database error');
            return;
        }
        res.send('User added successfully!');
    });
});



// Route to display all users
app.get('/users', (req, res) => {
    const query = 'SELECT id, name, email FROM users';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            res.status(500).send('Database error');
            return;
        }

        let html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <title>Users List</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f5f6fa;
                        margin: 20px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    h2 {
                        color: #333;
                    }
                    table {
                        border-collapse: collapse;
                        width: 90%;
                        max-width: 800px;
                        background-color: #fff;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                        border-radius: 10px;
                        overflow: hidden;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 12px;
                        text-align: left;
                    }
                    th {
                        background-color: #4CAF50;
                        color: white;
                    }
                    tr:hover {
                        background-color: #f1f1f1;
                    }
                    button {
                        padding: 8px 12px;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        transition: background-color 0.3s ease;
                    }
                    .delete-button {
                        background-color: #f44336;
                        color: white;
                    }
                    .delete-button:hover {
                        background-color: #d32f2f;
                    }
                    .update-button {
                        background-color: #2196F3;
                        color: white;
                    }
                    .update-button:hover {
                        background-color: #1976D2;
                    }
                    a {
                        margin-top: 20px;
                        text-decoration: none;
                        color: #4CAF50;
                    }
                    a:hover {
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <h2>Users List</h2>
                <table>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>`;

        results.forEach(user => {
            html += `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>
                        <form action="/delete-user/${user.id}" method="POST" style="display:inline;">
                            <button type="submit" class="delete-button">Delete</button>
                        </form>
                        <form action="/edit-user/${user.id}" method="GET" style="display:inline;">
                            <button type="submit" class="update-button">Update</button>
                        </form>
                    </td>
                </tr>`;
        });

        html += `
                </table>
                <a href="/">Back to Form</a>
            </body>
            </html>`;

        res.send(html);
    });
});
// Serve the form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
