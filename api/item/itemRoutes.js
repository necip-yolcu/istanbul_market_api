// routes/itemRoutes.js
const express = require('express');
const { createItem, getAllItems, updateStatus, getCountsByStatus, getCountsByDate, uploadPhoto, getImage, deleteItem } = require('./itemController');
const { authenticate } = require('../middleware/authenticate');
const multer = require('multer');

const router = express.Router();

const storage = multer.diskStorage({
    destination(req, file, callback) {
        console.log("destination: ", file)
        callback(null, './images');
    },
    filename(req, file, callback) {
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


module.exports = router;
