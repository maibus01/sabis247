const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, loginUser } = require('../controllers/usersController');

router.get('/', getAllUsers);
router.post('/register', createUser);
router.post('/login', loginUser);


module.exports = router;
