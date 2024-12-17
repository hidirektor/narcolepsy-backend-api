const PDFDocument = require('pdfkit');
const fs = require('fs');
const sharp = require("sharp");

class PdfGenerator {
    /**
     * Generates a single PDF document from an array of images.
     * Ensures images are added without distortion, with a fixed width of 800 pixels.
     * Handles large images properly, creating only one PDF file.
     * @param {Array} images - Array of image objects, each containing a buffer and originalname.
     * @param {string} outputPath - The path where the generated PDF will be saved.
     * @returns {Promise<number>} - Resolves with the number of pages in the generated PDF.
     */
    static async generatePdf(images, outputPath) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ autoFirstPage: false });
                const stream = fs.createWriteStream(outputPath);
                let pageCount = 0;

                doc.pipe(stream);

                images.sort((a, b) => a.originalname.localeCompare(b.originalname));

                images.forEach((image) => {
                    const buffer = image.buffer;

                    const tempImg = doc.openImage(buffer);
                    const aspectRatio = tempImg.height / tempImg.width;
                    const pdfWidth = 800;
                    const pdfHeight = pdfWidth * aspectRatio;

                    doc.addPage({ size: [pdfWidth, pdfHeight] }).image(buffer, 0, 0, {
                        width: pdfWidth,
                        height: pdfHeight,
                    });

                    pageCount++;
                });

                doc.end();

                stream.on('finish', () => {
                    resolve(pageCount);
                });

                stream.on('error', reject);
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = PdfGenerator;