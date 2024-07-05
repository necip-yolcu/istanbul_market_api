// routes/userRoutes.js
const express = require('express');
const { generateCode, validateCode, createUser, loginUser, getUsers } = require('./userController');
const router = express.Router();

router.post('/generate-invitation-code', generateCode);
router.post('/validate-invitation-code', validateCode);

router.post('/register', createUser);
router.post('/login', loginUser);
router.get('/listUsers',getUsers);

module.exports = router;
