// routes/userRoutes.js
import express, { Router } from 'express';
import { generateCode, validateCode, createUser, loginUser, getUsers, forgotPassword, changePassword, renameUser, deleteUser } from './userController';
import { logoUpload } from '../middleware/fileUploadConfig';
import { authenticate } from '../middleware/authenticate';

const router: Router = express.Router();

router.post('/generate-invitation-code', authenticate, generateCode);
router.post('/validate-invitation-code', validateCode);

router.post('/register', logoUpload.single('logo'), createUser);
router.post('/login', loginUser);
router.get('/listUsers', getUsers);

router.post('/forgot-password', forgotPassword);
router.post('/change-password', changePassword);

router.put('/rename-user/:id', authenticate, renameUser);
router.delete('/delete-user/:id', authenticate, deleteUser);

export default router;
