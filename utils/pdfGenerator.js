const PDFDocument = require('pdfkit');
const fs = require('fs');

class PdfGenerator {
    /**
     * Generates a PDF document from an array of images.
     * @param {Array} images - Array of image objects, each containing a buffer and originalname.
     * @param {string} outputPath - The path where the generated PDF will be saved.
     * @returns {Promise<number>} - Resolves with the number of pages in the generated PDF.
     */
    static async generatePdf(images, outputPath) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ autoFirstPage: false });
                const stream = fs.createWriteStream(outputPath);

                doc.pipe(stream);

                images.sort((a, b) => a.originalname.localeCompare(b.originalname));

                images.forEach((image) => {
                    const buffer = image.buffer;
                    doc.addPage().image(buffer, { fit: [500, 750], align: 'center', valign: 'center' });
                });

                doc.end();

                stream.on('finish', () => {
                    const pageCount = doc.bufferedPageRange().count;
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
