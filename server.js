const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis').default; 
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const { createClient } = require('redis');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Configure Redis client
const redisClient = createClient({ legacyMode: true });
redisClient.connect().catch(console.error);

// Set up session middleware with RedisStore
app.use(session({
    store: new RedisStore({ client: redisClient }), // Use RedisStore as a class
    secret: 'secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 } // 1 hour
}));

// In-memory "database" for example purposes
const users = {
    'abc@gmail.com': {
        password: bcrypt.hashSync('password123', 10), // Password is hashed
        name: 'abc'
    }
};

// Middleware to check if a user is logged in
function checkAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Route to render the login form
app.get('/login', (req, res) => {
    res.send(`
        <form action="/login" method="post">
            <label>Email:</label><input type="email" name="email" required><br>
            <label>Password:</label><input type="password" name="password" required><br>
            <button type="submit">Login</button>
        </form>
    `);
});

// Handle login logic
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users[email];

    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = { email, name: user.name };
        req.session.message = 'Login successful';
        res.redirect('/dashboard');
    } else {
        res.send('Invalid email or password. <a href="/login">Try again</a>');
    }
});

// Dashboard route (protected)
app.get('/dashboard', checkAuthenticated, (req, res) => {
    const message = req.session.message; // Get the message
    req.session.message = null; // Clear the message after displaying

    res.send(`
        <h1>Welcome, ${req.session.user.name}</h1>
        ${message ? `<p style="color: green;">${message}</p>` : ''}
        <p>This is your dashboard.</p>
        <a href="/logout">Logout</a>
    `);
});

// Handle logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.send('Error logging out.');
        }
        res.redirect('/login');
    });
});

// Root route redirects to login
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Start the server
app.listen(8002, () => {
    console.log('Server running on http://localhost:8002');
});
