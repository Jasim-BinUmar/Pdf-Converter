import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
const execAsync = promisify(exec);

export const compressGif = async (req, res) => {
  const { file } = req;
  if (!file) {
    return res.status(400).json({ message: 'No GIF file provided.' });
  }

  // const inputPath = file.path;
  // const outputPath = path.join(path.dirname(inputPath), `compressed-${file.filename}`);
    const uploadDir = path.join(process.cwd(), 'uploads')
    const inputPath = file.path;
    const outputPath = path.join(uploadDir, 'compressedGif.gif');

  try {
    console.log('Starting GIF compression...');
    await execAsync(`gifsicle --colors 64 --optimize=3 < "${inputPath}" > "${outputPath}"`);
    console.log('GIF successfully compressed!');
    res.status(200).json({
      message: 'GIF successfully compressed!',
      compressedFilePath: outputPath
    });
  } catch (error) {
    console.error('Error during GIF compression:', error.message);
    res.status(500).json({ message: 'Error during GIF compression.', error: error.message });
  }
};
