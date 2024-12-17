const db = require('../../models');
const GenericCRUD = require('../genericCrud');
const redisClient = require('../../utils/thirdParty/redis/redisClient');
const { errorSender } = require('../../utils');
const HttpStatusCode = require('http-status-codes');
const crypto = require('crypto');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

const storageService = new (require('../../utils/service/StorageService'))({
    endPoint: process.env.MINIO_ENDPOINT,
    port: +process.env.MINIO_PORT,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
});

const comicCrud = new GenericCRUD({ model: db.Comic });
const comicDetailsCrud = new GenericCRUD({ model: db.ComicDetails });
const comicSeasonsCrud = new GenericCRUD({ model: db.ComicSeason });
const comicEpisodesCrud = new GenericCRUD({ model: db.ComicEpisode });
const followedComicsCrud = new GenericCRUD({ model: db.FollowedComic });
const comicCategoryCrud = new GenericCRUD({ model: db.ComicCategory });
const comicCategoryMappingCrud = new GenericCRUD({ model: db.ComicCategoryMapping });

class ComicController {
    constructor() {}

    async createComicAsync(req, res) {
        try {
            const {
                comicName,
                comicDescription,
                comicDescriptionTitle,
                sourceCountry,
                publishDate, // DD.MM.YYYY formatında geliyor
                comicStatus,
                comicLanguage,
                comicAuthor,
                comicEditor,
                comicCompany,
                comicArtist,
            } = req.body;

            // Tarih formatını `YYYY-MM-DD`'ye dönüştür
            const [day, month, year] = publishDate.split('.');
            const formattedPublishDate = `${year}-${month}-${day}`;

            // UUID oluştur
            const comicID = uuidv4();

            // Comic Banner'ı MinIO'ya yükle
            const bannerPath = await storageService.uploadComicBanner(req.file, comicID);

            // Comic kaydını oluştur
            const comic = await comicCrud.create({
                comicID,
                comicName,
                comicDescription,
                comicDescriptionTitle,
                sourceCountry,
                publishDate: formattedPublishDate, // Dönüştürülmüş tarih
                comicBannerID: bannerPath,
            });

            // ComicDetails kaydını oluştur
            await comicDetailsCrud.create({
                comicID,
                comicStatus,
                comicLanguage,
                comicAuthor: comicAuthor || null,
                comicEditor: comicEditor || null,
                comicCompany: comicCompany || null,
                comicArtist: comicArtist || null,
            });

            res.status(201).json({ message: 'Comic created successfully', comic });
        } catch (error) {
            console.error('Error creating comic:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    async bulkCreateComicAsync(req, res) {
        const { userID } = req.body; // episodePublisher userID olarak gelecek

        try {
            if (!req.file) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'No file uploaded.' });
            }

            const zipStream = fs.createReadStream(req.file.path).pipe(unzipper.Parse({ forceStream: true }));
            let dataYML, comicBannerBuffer;
            const episodes = [];

            // Zip dosyasını aç ve verileri ayrıştır
            for await (const entry of zipStream) {
                const fileName = entry.path;

                if (fileName.endsWith('data.yml')) {
                    const content = await entry.buffer();
                    dataYML = yaml.load(content);
                } else if (fileName.endsWith('comic-banner.png')) {
                    comicBannerBuffer = await entry.buffer();
                } else if (fileName.startsWith('episodes/Bölüm')) {
                    const episodeNumber = parseInt(fileName.match(/\d+/)[0], 10);
                    const buffer = await entry.buffer();
                    episodes.push({ episodeNumber, buffer, name: path.dirname(fileName) });
                } else {
                    entry.autodrain();
                }
            }

            if (!dataYML || !comicBannerBuffer) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'Invalid zip structure.' });
            }

            // Kategori Kontrolü
            let category = await comicCategoryCrud.findOne({ where: { categoryName: dataYML.comicCategory } });
            if (!category.result) {
                category = await comicCategoryCrud.create({ categoryName: dataYML.comicCategory });
            }

            const comicID = uuidv4();
            const bannerPath = `comics/${comicID}/banner-${uuidv4()}.png`;
            await storageService.uploadFileToBucket(storageService.buckets.comics, bannerPath, comicBannerBuffer, 'image/png');

            // Comics ve ComicDetails Kayıtları
            const comic = await comicCrud.create({
                comicID,
                comicName: dataYML.comicName,
                comicDescriptionTitle: dataYML.comicDescriptionTitle,
                comicDescription: dataYML.comicDescription,
                publishDate: moment(dataYML.publishDate, 'DD.MM.YYYY').format('YYYY-MM-DD'),
                sourceCountry: dataYML.sourceCountry,
                comicBannerID: bannerPath
            });

            await comicDetailsCrud.create({
                comicID,
                comicStatus: dataYML.comicStatus,
                comicLanguage: dataYML.comicLanguage,
                comicAuthor: dataYML.comicAuthor || null,
                comicEditor: dataYML.comicEditor || null,
                comicCompany: dataYML.comicCompany || null,
                comicArtist: dataYML.comicArtist || null
            });

            // Episodes İşlemi
            for (const episode of episodes) {
                const folderPath = `comics/${comicID}/${episode.episodeNumber}/`;
                const bannerPath = `${folderPath}banner-${uuidv4()}.png`;
                const pdfPath = `${folderPath}episode-${uuidv4()}.pdf`;

                await storageService.uploadFileToBucket(storageService.buckets.comics, bannerPath, episode.buffer, 'image/png');

                const localPdfPath = `/tmp/${uuidv4()}.pdf`;
                const pageCount = await PdfGenerator.generatePdf([{ buffer: episode.buffer, originalname: 'page.png' }], localPdfPath);
                const pdfBuffer = fs.readFileSync(localPdfPath);

                await storageService.uploadFileToBucket(storageService.buckets.comics, pdfPath, pdfBuffer, 'application/pdf');
                fs.unlinkSync(localPdfPath);

                await comicEpisodesCrud.create({
                    episodeID: uuidv4(),
                    comicID,
                    seasonID: null,
                    episodeOrder: episode.episodeNumber,
                    episodePrice: 0.0,
                    episodeName: `Bölüm ${episode.episodeNumber}`,
                    episodePublisher: userID,
                    episodeBannerID: bannerPath,
                    episodeFileID: pdfPath,
                    episodePageCount: pageCount
                });
            }

            res.status(201).json({ message: 'Comic and episodes uploaded successfully.' });
        } catch (error) {
            console.error('Error in bulkCreateComicAsync:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Failed to upload comic and episodes.' });
        }
    }

    async changeComicBannerAsync(req, res) {
        try {
            const { comicID } = req.body;

            if (!comicID) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'comicID is required.' });
            }

            const comic = await comicCrud.findOne({ where: { comicID } });
            if (!comic || !comic.result) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Comic not found.' });
            }

            if (!req.file) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'A new comic banner file is required.' });
            }

            const newBannerPath = await storageService.uploadComicBanner(req.file, comicID);

            const oldBannerPath = comic.result.comicBannerID;
            if (oldBannerPath) {
                try {
                    await storageService.deleteFile(
                        storageService.buckets.comics,
                        oldBannerPath
                    );
                    console.log('Old banner deleted successfully:', oldBannerPath);
                } catch (error) {
                    console.error('Failed to delete old banner:', error.message);
                }
            }

            const updatedComic = await comicCrud.update(
                { where: { comicID } },
                { comicBannerID: newBannerPath }
            );

            if (!updatedComic.status) {
                throw new Error('Failed to update comicBannerID in database.');
            }

            res.status(200).json({ message: 'Comic banner updated successfully', newBannerPath });
        } catch (error) {
            console.error('Error updating comic banner:', error.message);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    async deleteComicAsync(req, res) {
        const { comicID } = req.params;

        try {
            const dependencies = await Promise.all([
                comicSeasonsCrud.getAll({ where: { comicID } }),
                comicEpisodesCrud.getAll({ where: { comicID } }),
                followedComicsCrud.getAll({ where: { comicID } }),
                comicCategoryMappingCrud.getAll({ where: { comicID } }),
            ]);

            if (dependencies.some(dep => dep.length > 0)) {
                const operationKey = crypto.randomUUID();
                await redisClient.set(
                    `operation:delete:comic:${operationKey}`,
                    JSON.stringify({ comicID }),
                    'EX',
                    180
                );

                return res.status(400).json({
                    message: 'Comic has dependencies. Deletion requires confirmation.',
                    operationKey,
                });
            }

            await comicDetailsCrud.delete({ where: { comicID } });
            await comicCrud.delete({ where: { comicID } });

            // Remove banner
            const bucketPath = `comics/${comicID}/`;
            await storageService.deleteFolder(storageService.buckets.comics, bucketPath);

            res.status(200).json({ message: 'Comic deleted successfully.' });
        } catch (error) {
            console.error('Error deleting comic:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send('Failed to delete comic.');
        }
    }

    async confirmDeleteComicAsync(req, res) {
        const { operationKey } = req.body;

        try {
            const data = await redisClient.get(`operation:delete:comic:${operationKey}`);

            if (!data) {
                return res.status(400).json({ message: 'Invalid or expired operation key.' });
            }

            const { comicID } = JSON.parse(data);
            await redisClient.del(`operation:delete:comic:${operationKey}`);

            await Promise.all([
                comicSeasonsCrud.delete({ where: { comicID } }),
                comicEpisodesCrud.delete({ where: { comicID } }),
                followedComicsCrud.delete({ where: { comicID } }),
                comicCategoryMappingCrud.delete({ where: { comicID } }),
                comicDetailsCrud.delete({ where: { comicID } }),
            ]);

            await comicCrud.delete({ where: { comicID } });

            // Remove banner
            const bucketPath = `comics/${comicID}/`;
            await storageService.deleteFolder(storageService.buckets.comics, bucketPath);

            res.status(200).json({ message: 'Comic and dependencies deleted successfully.' });
        } catch (error) {
            console.error('Error confirming comic deletion:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send('Failed to confirm deletion.');
        }
    }

    async editComicAsync(req, res) {
        try {
            const {
                comicID,
                comicName,
                comicDescription,
                comicDescriptionTitle,
                sourceCountry,
                publishDate,
                comicStatus,
                comicLanguage,
                comicAuthor,
                comicEditor,
                comicCompany,
                comicArtist,
            } = req.body;

            const comic = await comicCrud.findOne({ where: { comicID } });
            if (!comic) {
                throw errorSender.errorObject(HttpStatusCode.NOT_FOUND, 'Comic not found.');
            }

            const formattedPublishDate = publishDate
                ? moment(publishDate, 'DD.MM.YYYY').format('YYYY-MM-DD')
                : null;

            await comicCrud.update({ where: { comicID } }, {
                comicName,
                comicDescription,
                comicDescriptionTitle,
                sourceCountry,
                publishDate: formattedPublishDate,
            });

            await comicDetailsCrud.update({ where: { comicID } }, {
                comicStatus,
                comicLanguage,
                comicAuthor: comicAuthor || null,
                comicEditor: comicEditor || null,
                comicCompany: comicCompany || null,
                comicArtist: comicArtist || null,
            });

            const updatedComic = await comicCrud.findOne({ where: {comicID}});
            const updatedComicDetails = await comicDetailsCrud.findOne({ where: {comicID}});

            res.json({ message: 'Comic updated successfully', comic: updatedComic.result, comicDetails: updatedComicDetails.result });
        } catch (error) {
            console.error('Error editing comic:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    async getAllAsync(req, res) {
        try {
            const comics = await comicCrud.getAll();

            if (!comics || comics.length === 0) {
                return res.status(200).json([]);
            }

            const comicWithDetails = await Promise.all(
                comics.map(async (comic) => {
                    const comicDetails = await comicDetailsCrud.findOne({ where: { comicID: comic.comicID } });

                    return {
                        comic: comic,
                        comicDetails: comicDetails?.result || null, // Include comicDetails if found
                    };
                })
            );

            res.status(200).json(comicWithDetails);
        } catch (error) {
            console.error('Error fetching comics:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send('Failed to fetch comics.');
        }
    }

    async getByIdAsync(req, res) {
        const { comicID } = req.params;

        try {
            const comic = await comicCrud.findOne({ where: { comicID } });
            const comicDetails = await comicDetailsCrud.findOne({ where: { comicID } });
            res.status(200).json({comic: comic.result, comicDetails: comicDetails.result});
        } catch (error) {
            console.error('Error fetching comic:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send('Failed to fetch comic.');
        }
    }

    async getByCategoryAsync(req, res) {
        const { categoryName } = req.params;

        try {
            const category = await comicCategoryCrud.findOne({ where: { categoryName } });

            if (!category.result) {
                return res
                    .status(HttpStatusCode.NOT_FOUND)
                    .json({ message: `Category '${categoryName}' not found.` });
            }

            const categoryID = category.result.categoryID;

            const mappings = await comicCategoryMappingCrud.getAll({ where: { categoryID } });

            if (!mappings || mappings.length === 0) {
                return res
                    .status(HttpStatusCode.NOT_FOUND)
                    .json({ message: `No comics found for category '${categoryName}'.` });
            }

            const comicsWithDetails = await Promise.all(
                mappings.map(async (mapping) => {
                    const comic = await comicCrud.findOne({ where: { comicID: mapping.comicID } });
                    const comicDetails = await comicDetailsCrud.findOne({ where: { comicID: mapping.comicID } });

                    return {
                        comic: comic?.result || null,
                        comicDetails: comicDetails?.result || null,
                    };
                })
            );

            res.status(200).json(comicsWithDetails);
        } catch (error) {
            console.error('Error fetching comics by category:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send('Failed to fetch comics.');
        }
    }

    async getByEpisodeAsync(req, res) {
        const { episodeID } = req.params;

        try {
            const episode = await comicEpisodesCrud.findOne({
                where: { episodeID },
                include: [{ model: db.Comic, as: 'comic' }],
            });

            res.status(200).json(episode);
        } catch (error) {
            console.error('Error fetching comics by episode:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send('Failed to fetch comics.');
        }
    }
}

module.exports = ComicController;
