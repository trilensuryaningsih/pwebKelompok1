const express = require('express');
const app = express();
const port = 3000;   
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');

// Load environment variables from .env file
dotenv.config();

// Improved session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'mySuperSecretKey123',
    resave: true, // Changed to true to ensure session is saved
    saveUninitialized: false, // Changed to false for security
    cookie: { 
        secure: false, // Set to true if using https
        httpOnly: true, // Prevents XSS attacks
        maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        sameSite: 'lax' // Protects against CSRF
    },
    name: 'sessionId', // Custom session name
    rolling: true, // Extends session on each request
    unset: 'destroy' // Destroys session when unset
}));   

// Parse incoming request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import middleware
const { refreshSession } = require('./src/middleware/auth');

// Apply session refresh middleware globally
app.use(refreshSession);

// Import routes
const authRoutes = require('./src/routes/auth.routes.js');

// Gunakan routes
app.use('/api/auth', authRoutes);

// Middleware for parsing JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const routerUser = require ("./src/routes/user.js");
app.use('/user', routerUser);
app.use('/auth', authRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', require('./src/routes/auth.routes.js'));
app.use('/admin', require('./src/routes/admin'));
app.use('/daftar', require('./src/routes/admin'));
app.use('/tambah', require('./src/routes/admin'));
app.use('/hapus', require('./src/routes/admin'));
app.use('/edit', require('./src/routes/admin'));


// app setting
app.set("view engine", "ejs");
app.set("views", "./src/views");

// ...existing code...
app.use(express.static('src/public'));


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});