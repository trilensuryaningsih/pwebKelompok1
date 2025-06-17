const express = require('express');
const app = express();
const port = 3000;   
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const session = require('express-session');

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
app.use('/', require('./src/routes/auth.routes.js'));


// app setting
app.set("view engine", "ejs");
app.set("views", "./src/views");

// ...existing code...
app.use(express.static('src/public'));


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
