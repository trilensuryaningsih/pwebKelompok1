const express = require('express');

const router = express.Router();

// GET all users
router.get('/', (req, res) => {
    res.send('Get all users');
});

// // GET user by ID
// router.get('/:id', (req, res) => {
//     res.send(`Get user with ID ${req.params.id}`);
// });

// // POST create new user
// router.post('/', (req, res) => {
//     res.send('Create new user');
// });

// // PUT update user
// router.put('/:id', (req, res) => {
//     res.send(`Update user with ID ${req.params.id}`);
// });

// // DELETE user
// router.delete('/:id', (req, res) => {
//     res.send(`Delete user with ID ${req.params.id}`);
// });

module.exports = router;