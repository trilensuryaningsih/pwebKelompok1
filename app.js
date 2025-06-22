const express = require('express');
const app = express();
const port = 3000;   
const dotenv = require('dotenv');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');

// Load environment variables from .env file
dotenv.config();

// Test database connection
const { sequelize } = require('./src/models');
sequelize.authenticate()
    .then(() => {
        console.log('Database connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

// Middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: 'mySuperSecretKey123',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using https
}));   

// Load environment variables from .env file
dotenv.config();

// Parse incoming request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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