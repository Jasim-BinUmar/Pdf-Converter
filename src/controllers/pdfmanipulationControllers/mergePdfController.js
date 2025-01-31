const path = require("path")
const fs = require("fs")
const fsPromises = fs.promises

const mergePdf = async (req, res) => {
  const { default: PDFMerger } = await import("pdf-merger-js")
  if (!req.files || req.files.length < 2) {
    return res.status(400).json({ message: "Please upload at least two PDF files." })
  }

  const merger = new PDFMerger()
  const outputPath = path.join(__dirname, "../../../uploads", `${Date.now()}_merged.pdf`)

  try {
    // Parse merge instructions from the request body
    const mergeInstructions = JSON.parse(req.body.mergeInstructions || "[]")

    // Merge PDFs according to instructions
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i]
      const instruction = mergeInstructions[i] || "all"

      if (instruction === "all") {
        await merger.add(file.path)
      } else if (typeof instruction === "number") {
        await merger.add(file.path, instruction)
      } else if (Array.isArray(instruction)) {
        await merger.add(file.path, instruction)
      } else if (typeof instruction === "string") {
        await merger.add(file.path, instruction)
      }
    }

    // Set metadata
    await merger.setMetadata({
      producer: "pdf-merger-js based script",
      author: "PDF Manipulation API",
      creator: "PDF Manipulation API",
      title: "Merged PDF Document",
    })

    // Save the merged PDF
    await merger.save(outputPath)

    console.log("PDF merge completed successfully!")

    // Send the merged PDF as a download
    res.download(outputPath, "merged.pdf", async (err) => {
      if (err) {
        console.error("Download error:", err)
        if (!res.headersSent) {
          res.status(500).json({ message: "Error downloading the merged PDF" })
        }
      }

      // Clean up
      await Promise.all([
        ...req.files.map((file) => fsPromises.unlink(file.path)),
        fsPromises.unlink(outputPath),
      ]).catch(console.error)
    })
  } catch (error) {
    console.error("Error during PDF merge:", error)
    res.status(500).json({ message: "Error merging PDFs", error: error.message })

    // Clean up in case of error
    await Promise.all(req.files.map((file) => fsPromises.unlink(file.path))).catch(console.error)
  }
}

module.exports = {
  mergePdf,
}

