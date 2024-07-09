// routes/itemRoutes.js
import { Router, Request, Response, NextFunction } from 'express';
import { createItem, getAllItems, updateStatus, getCountsByStatus, getCountsByDate, uploadPhoto, getImage, deleteItem } from './itemController';
import { authenticate } from '../middleware/authenticate';
import multer, { diskStorage, StorageEngine } from 'multer';

const router = Router();

const storage: StorageEngine = diskStorage({
    destination(req: Request, file: Express.Multer.File, callback: (error: Error | null, destination: string) => void) {
        console.log("destination: ", file)
        callback(null, './images');
    },
    filename(req: Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) {
        console.log("filename: ", file)
        callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
    },
});
  
const upload = multer({ storage });

router.post('/create', upload.array('photo'), /*authenticate,*/ createItem);
router.get('/get_all', getAllItems);
//router.get('/get/:userId', authenticate, getUserItems);
router.put('/updateStatus/:itemId', /*authenticate,*/ updateStatus);
router.get('/countsByStatus', getCountsByStatus);
router.get('/countsByDates', getCountsByDate);
router.post('/upload', upload.array('photo', 3), uploadPhoto);
router.get('/images/:imageName', getImage);
router.delete('/delete/:itemId', /*authenticate,*/ deleteItem);


export default router;
