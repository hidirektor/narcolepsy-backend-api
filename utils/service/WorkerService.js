const NotificationService = require('./NotificationService');
const PdfGenerator = require('../pdfGenerator');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

const GenericCRUD = require('../../controllers/genericCrud');
const db = require("../../models");
const {join} = require("node:path");
const episodeCrud = new GenericCRUD({ model: db.ComicEpisode });
const userCrud = new GenericCRUD({ model: db.User });

const storageService = new (require('./StorageService'))({
    endPoint: process.env.MINIO_ENDPOINT,
    port: +process.env.MINIO_PORT,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
});

class WorkerService {
    static async processEpisodesInBackground(episodes, comicID, userID, bannerPath, unzippedFolder) {
        try {
            console.log('Worker started: Processing episodes...');

            // 1. Bölümleri episodeNumber'a göre grupla
            const groupedEpisodes = episodes.reduce((acc, episode) => {
                if (!episode.episodeNumber || !episode.buffer || !episode.originalname) {
                    console.warn(`Skipping invalid episode: ${JSON.stringify(episode)}`);
                    return acc;
                }
                acc[episode.episodeNumber] = acc[episode.episodeNumber] || [];
                acc[episode.episodeNumber].push(episode);
                return acc;
            }, {});

            console.log('Grouped Episodes:', Object.keys(groupedEpisodes));

            // 2. Her episodeNumber için PDF oluştur ve kaydet
            for (const [episodeNumber, episodePages] of Object.entries(groupedEpisodes)) {
                const episodeID = uuidv4();
                const folderPath = `comics/${comicID}/episodes/`;
                const pdfPath = `${folderPath}episode-${episodeID}.pdf`;

                console.log(`Processing Episode ${episodeNumber}...`);

                // 4. PDF oluştur
                const localPdfPath = `/tmp/${uuidv4()}.pdf`;
                const pageCount = await PdfGenerator.generatePdf(
                    episodePages, // PdfGenerator için format
                    localPdfPath
                );

                console.log(`PDF generated for Episode ${episodeNumber}: ${localPdfPath}, Pages: ${pageCount}`);

                // 5. PDF dosyasını MinIO'ya yükle
                const pdfBuffer = fs.readFileSync(localPdfPath);
                await storageService.uploadFileToBucket(
                    storageService.buckets.comics,
                    pdfPath,
                    pdfBuffer,
                    'application/pdf'
                );

                // Geçici PDF dosyasını sil
                fs.unlinkSync(localPdfPath);

                // 6. Bölüm kaydı oluştur
                await episodeCrud.create({
                    episodeID,
                    comicID,
                    seasonID: null,
                    episodeOrder: parseInt(episodeNumber),
                    episodePrice: 0.0,
                    episodeName: `${episodeNumber}. Bölüm`,
                    episodePublisher: userID,
                    episodeBannerID: bannerPath || null,
                    episodeFileID: pdfPath,
                    episodePageCount: pageCount,
                });

                console.log(`Episode ${episodeNumber} processed successfully.`);
            }

            // 7. Kullanıcıya başarı e-postası gönder
            const user = await userCrud.findOne({ where: { userID } });
            if (user?.result?.eMail) {
                await NotificationService.queueEmail(
                    'process-success',
                    { comicID },
                    user.result.eMail,
                    'Episodes processing completed'
                );
            }

            // 8. Yükleme klasörünü temizle
            await storageService.deleteFolder(storageService.buckets.uploads, unzippedFolder);

            console.log('Worker completed: Episodes processed successfully.');
        } catch (error) {
            console.error('Worker error while processing episodes:', error.message);

            // Kullanıcıya hata e-postası gönder
            const user = await userCrud.findOne({ where: { userID } });
            if (user?.result?.eMail) {
                await NotificationService.queueEmail(
                    'process-failure',
                    { message: error.message },
                    user.result.eMail,
                    'Episodes processing failed'
                );
            }
        }
    }
}

module.exports = WorkerService;