const express = require('express');
const upload = require('../middleware/multerConfig');
const {createGif} = require ('../controllers/gifControllers/createGifController')
const router = express.Router();

//Route to Create Gif
router.post('/create-gif', upload.single('mediaFile'), createGif);

module.exports = router;
