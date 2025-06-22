const express = require('express');
const app = express();
const port = 3000;   
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize } = require('./src/models');

// Load environment variables from .env file
dotenv.config();

// Parse incoming request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware for parsing JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser must come before session
app.use(cookieParser());

// Create session store
const sessionStore = new SequelizeStore({
    db: sequelize,
    tableName: 'Sessions'
});

// Sync session store
sessionStore.sync();

// Session middleware
app.use(session({
    secret: 'mySuperSecretKey123',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { 
        secure: false, // Set to true if using https
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax'
    },
    name: 'connect.sid', // Explicitly set cookie name
    rolling: true, // Reset expiration on every request
    unset: 'destroy' // Destroy session when unset
}));   

// Flash messages middleware
app.use(flash());

// Middleware to pass flash messages to all views
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success');
    res.locals.error_msg = req.flash('error');
    next();
});

// Middleware to prevent caching for authenticated routes
app.use((req, res, next) => {
    // Prevent caching for routes that require authentication
    if (req.path.startsWith('/admin') || req.path.startsWith('/pj') || req.path.startsWith('/user')) {
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
    }
    next();
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('src/public'));

// Logger
app.use(logger('dev'));

// Import routes
const authRoutes = require('./src/routes/auth.routes.js');

// Routes
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/', require('./src/routes/auth.routes.js'));
app.use('/admin', require('./src/routes/admin'));
app.use('/daftar', require('./src/routes/admin'));
app.use('/tambah', require('./src/routes/admin'));
app.use('/hapus', require('./src/routes/admin'));
app.use('/edit', require('./src/routes/admin'));
app.use('/pj', require('./src/routes/pj'));

const routerUser = require ("./src/routes/user.js");
app.use('/user', routerUser);

// app setting
app.set("view engine", "ejs");
app.set("views", "./src/views");

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});