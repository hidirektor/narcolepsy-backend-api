const vision = require('@google-cloud/vision');
const axios = require('axios');
const sharp = require('sharp');
require('dotenv').config();

class ImageTranslationUtil {

    /**
     * Görselin içindeki İngilizce metni Türkçeye çevirir ve metni görselin üzerine ekler.
     * @param {Buffer} imageBuffer - İşlenecek görselin buffer verisi.
     * @param {string} lang - Çeviri yapılacak dil (varsayılan: 'tr').
     * @returns {Promise<Buffer>} - İşlenmiş görselin buffer verisi.
     */
    static async processImageTranslation(imageBuffer, lang = 'tr') {
        try {
            const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
            if (!apiKey) throw new Error('Google Translate API anahtarı bulunamadı!');

            const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIAL_JSON);
            const client = new vision.ImageAnnotatorClient({ credentials });


            const [result] = await client.textDetection(imageBuffer);
            const detections = result.textAnnotations;
            if (!detections || detections.length === 0) return imageBuffer;

            const metadata = await sharp(imageBuffer).metadata();
            const width = metadata.width;
            const height = metadata.height;

            let overlays = [];

            for (let i = 1; i < detections.length; i++) {
                const text = detections[i].description;
                if (!/^[a-zA-Z0-9.,!? ]+$/.test(text)) continue;

                const vertices = detections[i].boundingPoly.vertices;
                const x = vertices[0].x || 0;
                const y = vertices[0].y || 0;
                const widthBox = vertices[1].x - vertices[0].x || 100;
                const heightBox = vertices[2].y - vertices[0].y || 30;

                const translateResponse = await axios.post(
                    `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
                    {
                        q: text,
                        target: lang
                    }
                );
                const translation = translateResponse.data.data.translations[0].translatedText;

                overlays.push({
                    input: Buffer.from(
                        `<svg width=\"${widthBox}\" height=\"${heightBox}\">
                            <foreignObject width=\"100%\" height=\"100%\">
                                <div xmlns=\"http://www.w3.org/1999/xhtml\" style=\"font-size:20px; white-space:nowrap;\">${translation}</div>
                            </foreignObject>
                         </svg>`
                    ),
                    top: y,
                    left: x
                });
            }

            const imgWithText = await sharp(imageBuffer)
                .composite(overlays)
                .toBuffer();

            return imgWithText;
        } catch (error) {
            console.error('Image Translation Error:', error);
            return imageBuffer;
        }
    }
}

module.exports = ImageTranslationUtil;