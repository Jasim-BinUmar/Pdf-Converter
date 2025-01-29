const pdf2excel = require("pdf-to-excel")
const path = require("path");
const archiver = require("archiver");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const fsPromises = require("fs").promises;

const pdfToImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload a PDF file." });
  }

  const workDir = path.join(__dirname, "../../uploads", uuidv4());
  const outputDir = path.join(workDir, "output");
  console.log("Here at start ");
  console.log("Working dir is: " + workDir);
  console.log("Output dir is:  "+ outputDir);
  try {
    await fsPromises.mkdir(workDir, { recursive: true });
    await fsPromises.mkdir(outputDir, { recursive: true });

    const { pdf } = await import("pdf-to-img");

    let counter = 1;
    const document = await pdf(req.file.path, { scale: 3 });

    for await (const image of document) {
      await fsPromises.writeFile(path.join(outputDir, `page${counter}.png`), image);
      counter++;
    }

    // Create a zip file
    const zipPath = path.join(workDir, "images.zip");
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    console.log("zip path: "+zipPath);

    archive.pipe(output);
    archive.directory(outputDir, false);

    await archive.finalize();

    // Wait for the archive stream to finish before sending the file
    output.on("close", async () => {
      res.download(zipPath, "pdf_images.zip", async (err) => {
        if (err) {
          console.error("Download error:", err);
          if (!res.headersSent) {
            res.status(500).json({ message: "Error downloading the images" });
          }
        }

        console.log("This is the work dir: " + workDir);
        // Clean up
        // await fsPromises.rm(workDir, { recursive: true, force: true });
        // await fsPromises.unlink(req.file.path).catch(() => {});
      });
    });

  } catch (error) {
    console.error("Error during PDF to Image conversion:", error);
    res.status(500).json({ message: "Error converting PDF to images", error: error.message });

    // Clean up in case of error
    // await fsPromises.rm(workDir, { recursive: true, force: true }).catch(() => {});
    // await fsPromises.unlink(req.file.path).catch(() => {});
  }
};

// Endpoint to convert PDF to Excel
const pdfToExcel = async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a PDF file." })
    }
  
    const inputPath = req.file.path
    const outputPath = path.join(__dirname, "../../uploads", `${Date.now()}_output.xlsx`)
  
    try {
      const options = {
        onProcess: (e) => console.log(`Converting page ${e.numPage} of ${e.numPages}`),
        start: 1,
        end: undefined,
      }
  
      console.log("Starting PDF to Excel conversion...")
      console.log("Input file:", inputPath)
      console.log("Output file:", outputPath)
  
      await pdf2excel.genXlsx(inputPath, outputPath, options)
  
      console.log("Conversion completed successfully!")
  
      res.download(outputPath, "converted.xlsx", async (err) => {
        if (err) {
          console.error("Download error:", err)
          if (!res.headersSent) {
            res.status(500).json({ message: "Error downloading the Excel file" })
          }
        }
  
        // Clean up
        // await fsPromises.unlink(inputPath).catch(console.error)
        // await fsPromises.unlink(outputPath).catch(console.error)
      })
    } catch (error) {
      console.error("Error during PDF to Excel conversion:", error)
      res.status(500).json({ message: "Error converting PDF to Excel", error: error.message })
  
      // Clean up in case of error
      //await fsPromises.unlink(inputPath).catch(console.error)
    }
  }
  

module.exports = {
  pdfToImage,
  pdfToExcel,
};
