// routes/itemRoutes.js
import { Router, Request, Response, NextFunction } from 'express';
import { createItem, getAllItems, updateStatus, getCountsByStatus, getCountsByDate, uploadPhoto, getImage, deleteItem } from './itemController';
import { itemUpload } from '../middleware/fileUploadConfig';

const router = Router();
  

router.post('/create', itemUpload.array('photo'), /*authenticate,*/ createItem);
router.get('/get_all', getAllItems);
//router.get('/get/:userId', authenticate, getUserItems);
router.put('/updateStatus/:itemId', /*authenticate,*/ updateStatus);
router.get('/countsByStatus', getCountsByStatus);
router.get('/countsByDates', getCountsByDate);
router.post('/upload', itemUpload.array('photo', 3), uploadPhoto);
router.get('/images/:imageName', getImage);
router.delete('/delete/:itemId', /*authenticate,*/ deleteItem);


export default router;
