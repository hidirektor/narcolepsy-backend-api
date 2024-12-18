const { encrypt } = require('node-qpdf2');
const PDFDocument = require('pdfkit');
const fs = require('fs');

class PdfGenerator {
    static async generatePdf(images, outputPath) {
        try {
            const userPassword = process.env.PDF_USER_PASSWORD;
            const ownerPassword = process.env.PDF_OWNER_PASSWORD;

            if (!userPassword || !ownerPassword) {
                throw new Error('PDF şifreleri .env dosyasından yüklenemedi. Lütfen .env dosyasını kontrol edin.');
            }

            // 1. PDF oluştur (Geçici PDF dosyasını oluşturmak için PDFKit kullanıyoruz)
            const tempPath = outputPath.replace('.pdf', '-temp.pdf');
            const doc = new PDFDocument({ autoFirstPage: false });
            const stream = fs.createWriteStream(tempPath);
            let pageCount = 0;

            doc.pipe(stream);

            // Görselleri sıralayıp PDF'e ekle
            images.sort((a, b) => a.originalname.localeCompare(b.originalname));
            images.forEach((image) => {
                const tempImg = doc.openImage(image.buffer);
                const aspectRatio = tempImg.height / tempImg.width;
                const pdfWidth = 800;
                const pdfHeight = pdfWidth * aspectRatio;

                doc.addPage({ size: [pdfWidth, pdfHeight] }).image(image.buffer, 0, 0, {
                    width: pdfWidth,
                    height: pdfHeight,
                });

                pageCount++;
            });

            doc.end();

            await new Promise((resolve, reject) => {
                stream.on('finish', resolve);
                stream.on('error', reject);
            });

            // 2. QPDF ile şifreleme ve kısıtlama işlemi
            const options = {
                input: tempPath,
                output: outputPath,
                password: userPassword,
                keyLength: 256, // AES 256 şifreleme
                restrictions: {
                    print: 'none', // Yazdırma devre dışı
                    modify: 'none', // Düzenleme devre dışı
                    extract: 'n',   // Kopyalama devre dışı
                    useAes: true,   // AES şifreleme
                },
            };

            await encrypt(options);

            // Geçici dosyayı sil
            fs.unlinkSync(tempPath);

            return pageCount;
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    }
}

module.exports = PdfGenerator;