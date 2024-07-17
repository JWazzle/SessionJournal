const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'jwang',
    password: '',
    database: 'sessionjournal'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL connected...');
});

// User login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            const user = result[0];
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    const token = jwt.sign({ id: user.id }, 'secretkey', { expiresIn: '1h' });
                    res.json({ token });
                } else {
                    res.status(400).json({ msg: 'Invalid credentials' });
                }
            });
        } else {
            res.status(400).json({ msg: 'User not found' });
        }
    });
});

// User registration
app.post('/register', (req, res) => {
    const { email, password } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) throw err;
        db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hash], (err, result) => {
            if (err) throw err;
            res.json({ msg: 'User registered' });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
