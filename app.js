const express = require('express');

const app = express();
const port = 3000;   


// Middleware for parsing JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const routerUser = require ("./src/routes/user.js");
app.use('/user', routerUser);

// Basic route
app.get('/', (req, res) => {
    res.send('Server berhahasil berjalan');
});

// app setting
app.set("view engine", "ejs");
app.set("views", "./src/views");

//url handling
app.use("/user", routerUser)

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
