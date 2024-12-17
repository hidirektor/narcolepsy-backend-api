const NotificationService = require('./NotificationService');
const PdfGenerator = require('../pdfGenerator');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const GenericCRUD = require('../../controllers/genericCrud');
const db = require("../../models");
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
        console.log(episodes);
        try {
            console.log('Worker started: Processing episodes...');
            const episodeID = uuidv4();
            const folderPath = `comics/${comicID}/episodes/`;
            const pdfPath = `${folderPath}episode-${episodeID}.pdf`;

            // Görselleri isim sırasına göre sırala
            const sortedEpisodes = episodes.sort((a, b) => a.episodeNumber - b.episodeNumber);

            // Tek bir PDF oluştur
            const localPdfPath = `/tmp/${uuidv4()}.pdf`;
            const pageCount = await PdfGenerator.generatePdf(sortedEpisodes.map(e => e.buffer), localPdfPath);

            const pdfBuffer = fs.readFileSync(localPdfPath);

            // PDF dosyasını MinIO'ya yükle
            await storageService.uploadFileToBucket(storageService.buckets.comics, pdfPath, pdfBuffer, 'application/pdf');
            fs.unlinkSync(localPdfPath);

            // Tek bir bölüm kaydı oluştur
            await episodeCrud.create({
                episodeID,
                comicID,
                seasonID: null,
                episodeOrder: 1,
                episodePrice: 0.0,
                episodeName: '1. Bölüm',
                episodePublisher: userID,
                episodeBannerID: bannerPath || null,
                episodeFileID: pdfPath,
                episodePageCount: pageCount,
            });

            // Kullanıcıya başarı e-postası gönder
            const user = await userCrud.findOne({ where: { userID } });
            if (user.result) {
                await NotificationService.queueEmail(
                    'process-success',
                    { comicID },
                    user.result.eMail,
                    'Episodes processing completed'
                );
            }

            // Klasörü sil
            await storageService.deleteFolder(storageService.buckets.uploads, `${unzippedFolder}/`);

            console.log('Worker completed: Episodes processed successfully.');
        } catch (error) {
            console.error('Worker error while processing episodes:', error.message);

            // Kullanıcıya hata e-postası gönder
            const user = await userCrud.findOne({ where: { userID } });
            if (user.result) {
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