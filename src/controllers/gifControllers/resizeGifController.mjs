import gifResize from '@gumlet/gif-resize';
import fs from 'fs';
import path from 'path';

export const resizeGif = async (req, res) => {
  const { file } = req;

  if (!file) {
    return res.status(400).json({ message: 'No GIF file provided.' });
  }

  if(!req.body.dimensions){
    return res.status(400).json({message: 'Please provide resizing dimensions.'});
  }


  const uploadDir = path.join(process.cwd(), 'uploads')
  const inputPath = file.path;
  const dimensions = JSON.parse(req.body.dimensions);
  const outputPath = path.join(uploadDir, 'resizedGif.gif');
  console.log("outputPath: " + outputPath)
  
  //const outputPath = path.join(path.dirname(inputPath), `resized-${file.filename}`);
  
  try {
    const buf = fs.readFileSync(inputPath);
    const resizedGif = await gifResize({ width: dimensions.width, height: dimensions.height })(buf);
    
    fs.writeFileSync(outputPath, resizedGif);
    console.log('GIF resized and saved as', outputPath);

    res.status(200).json({
      message: 'GIF resized successfully!',
      resizedGifPath: outputPath
    });
  } catch (error) {
    console.error('Error resizing GIF:', error);
    res.status(500).json({ message: 'Error resizing GIF', error: error.message });
  }
};
