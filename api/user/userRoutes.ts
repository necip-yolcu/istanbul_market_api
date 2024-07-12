// routes/userRoutes.js
import express, { Router } from 'express';
//import { generateCode, validateCode, createUser, loginUser, getUsers } from './userController';
import { getUsers } from './userController';
const router: Router = express.Router();

// router.post('/generate-invitation-code', generateCode);
// router.post('/validate-invitation-code', validateCode);

// router.post('/register', createUser);
// router.post('/login', loginUser);
router.get('/listUsers', getUsers);

export default router;
