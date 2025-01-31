import path from "path"
import fs from "fs"
import { promises as fsPromises } from "fs"
import splitPdf from "@vtfk/pdf-splitter"
import { v4 as uuidv4 } from "uuid"
import archiver from "archiver"

const splitPdfFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload a PDF file." })
  }

  if (!req.body.ranges) {
    return res.status(400).json({ message: "Please provide splitting ranges." })
  }

  const workDir = path.join(process.cwd(), "uploads", uuidv4())
  const outputDir = path.join(workDir, "output")

  try {
    await fsPromises.mkdir(workDir, { recursive: true })
    await fsPromises.mkdir(outputDir, { recursive: true })

    const pdfToSplit = {
      pdf: req.file.path,
      ranges: JSON.parse(req.body.ranges),
      outputDir: outputDir,
      outputName: "splittedPdf",
      pdftkPath: process.env.PDFTK_EXT, // Make sure this environment variable is set
    }

    const result = await splitPdf(pdfToSplit)
    console.log("Split result:", result)

    // Create a zip file of the split PDFs
    const archive = archiver("zip", { zlib: { level: 9 } })
    const zipPath = path.join(workDir, "split_pdfs.zip")
    const output = fs.createWriteStream(zipPath)

    archive.pipe(output)
    archive.directory(outputDir, false)
    await archive.finalize()

    // Send the zip file
    res.download(zipPath, "split_pdfs.zip", async (err) => {
      if (err) {
        console.error("Download error:", err)
        if (!res.headersSent) {
          res.status(500).json({ message: "Error downloading the split PDFs" })
        }
      }

      // Clean up
      // await fsPromises.rm(workDir, { recursive: true, force: true })
      // await fsPromises.unlink(req.file.path)
    })
  } catch (error) {
    console.error("Error during PDF splitting:", error)
    res.status(500).json({ message: "Error splitting PDF", error: error.message })

    // Clean up in case of error
    await fsPromises.rm(workDir, { recursive: true, force: true }).catch(() => {})
    await fsPromises.unlink(req.file.path).catch(() => {})
  }
}

export { splitPdfFile }

