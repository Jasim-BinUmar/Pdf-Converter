const fs = require('fs/promises');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const sharp = require('sharp');

// Function to create GIF from video
async function createGifFromVideo(inputPath, outputPath, options = {}) {
  const { duration = 5, fps = 10, width = 320, loop = 0 } = options;

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(0)
      .setDuration(duration)
      .fps(fps)
      .size(`${width}x?`)
      .output(outputPath)
      .outputOptions('-loop', loop)
      .on('end', () => {
        console.log('GIF created successfully from video');
        resolve();
      })
      .on('error', (err) => {
        console.error('Error creating GIF from video:', err);
        reject(err);
      })
      .run();
  });
}

// Function to create GIF from image
async function createGifFromImage(inputPath, outputPath, options = {}) {
  const { duration = 3, fps = 10, width = 320, loop = 0 } = options;

  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const height = Math.round((width / metadata.width) * metadata.height);

  const resizedImage = await image.resize(width, height).toBuffer();

  const frames = [];
  const frameCount = duration * fps;

  for (let i = 0; i < frameCount; i++) {
    frames.push(resizedImage);
  }

  await sharp({
    create: {
      width: width,
      height: height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite(frames.map(() => ({ input: resizedImage })))
    .gif({ loop: loop, delay: Math.round(1000 / fps) })
    .toFile(outputPath);

  console.log('GIF created successfully from image');
}

async function createGif(req, res) {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'No media file provided.' });
  }
  uploadDir = path.join(__dirname, '../../../uploads')
  const inputPath = file.path;
  const outputPath = path.join(uploadDir, 'outputGif.gif');
  console.log(outputPath);
  const fileExtension = path.extname(inputPath).toLowerCase();
  const videoExtensions = ['.mp4', '.avi', '.mov', '.webm'];
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  try {
    if (videoExtensions.includes(fileExtension)) {
      await createGifFromVideo(inputPath, outputPath);
    } else if (imageExtensions.includes(fileExtension)) {
      await createGifFromImage(inputPath, outputPath);
    } else {
      throw new Error('Unsupported file format');
    }

    res.status(200).json({ message: 'GIF created successfully.', path: outputPath });
  } catch (error) {
    console.error('Error creating GIF:', error);
    res.status(500).json({ message: 'Error creating GIF', error: error.message });
  }
}


module.exports = { createGif };
