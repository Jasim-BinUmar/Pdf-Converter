const express = require('express');
const upload = require('../middleware/multerConfig');
const {createGif} = require ('../controllers/gifControllers/createGifController');
//const { resizeGif } = require('../controllers/gifControllers/resizeGifController.mjs');
const router = express.Router();

//Route to Create Gif
router.post('/create-gif', upload.single('mediaFile'), createGif);

//Route to Compress Gif
router.post('/compress-gif', upload.single('gif'), async(req, res)=>{
    try {
        const {compressGif} = await import('../controllers/gifControllers/compressGifController.mjs')
        await compressGif(req,res);
    } catch (error) {
        console.error('Error importing or executing compress Gif:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

//Route to Resize Gif
router.post('/resize-gif', upload.single('gif'), async(req, res)=>{
    try {
        const {resizeGif} = await import('../controllers/gifControllers/resizeGifController.mjs')
        await resizeGif(req,res);
    } catch (error) {
        console.error('Error importing or executing compress Gif:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

module.exports = router;
