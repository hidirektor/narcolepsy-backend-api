const Minio = require('minio');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const roles = require('../../models/roles');

class StorageService {
    constructor(minioConfig) {
        this.minioClient = new Minio.Client(minioConfig);
        this.buckets = {
            profiles: 'narcolepsy-backend-profiles',
            comics: 'narcolepsy-backend-comics',
            tickets: 'narcolepsy-backend-support-tickets'
        };

        this._ensureBucketsExist().catch(err => {
            console.error('Error ensuring buckets exist:', err);
            process.exit(1);
        });
    }

    async _ensureBucketsExist() {
        for (const bucketName of Object.values(this.buckets)) {
            const exists = await this.minioClient.bucketExists(bucketName);
            if (!exists) {
                await this.minioClient.makeBucket(bucketName);
                console.log(`Bucket created: ${bucketName}`);
            } else {
                console.log(`Bucket already exists: ${bucketName}`);
            }
        }
    }

    /**
     * Upload a file to the storage.
     * @param {Object} file - The file object (from multer).
     * @param {string} fileType - The type of file ('profilePhoto' or 'comic').
     * @param {Object} userData - Additional user data (eMail, phoneNumber, countryCode, userRole).
     * @param {Object} callbacks - Optional callbacks { onSuccess: Function, onFail: Function }
     * @returns {Promise<string>} - The fileName of the uploaded file.
     */
    async uploadFile(file, fileType, userData, { onSuccess, onFail } = {}) {
        try {
            let fileName;
            if (fileType === 'profilePhoto') {
                fileName = await this._uploadProfilePhoto(file, userData);
            } else if (fileType === 'comic') {
                fileName = await this._uploadComic(file);
            } else {
                throw new Error('Invalid file type');
            }

            if (onSuccess && typeof onSuccess === 'function') {
                onSuccess(fileName);
            }

            return fileName;
        } catch (error) {
            if (onFail && typeof onFail === 'function') {
                onFail(error);
            }
            throw error;
        }
    }

    async downloadFile(bucketName, fileName) {
        const filePath = path.join('/tmp', fileName);
        const stream = await this.minioClient.getObject(bucketName, fileName);
        const fileStream = fs.createWriteStream(filePath);

        return new Promise((resolve, reject) => {
            stream.pipe(fileStream);
            fileStream.on('finish', () => resolve(filePath));
            fileStream.on('error', reject);
        });
    }

    async deleteFile(bucketName, fileName) {
        await this.minioClient.removeObject(bucketName, fileName);
    }

    async viewFile(bucketName, fileName) {
        return this.minioClient.presignedGetObject(bucketName, fileName);
    }

    async _uploadProfilePhoto(file, { eMail, phoneNumber, countryCode, userRole }) {
        if (file.mimetype === 'image/gif') {
            if (userRole !== roles.PREMIUM) {
                throw new Error('Only PREMIUM users can upload GIFs.');
            }

            if (file.size > 10 * 1024 * 1024) {
                throw new Error('GIF file size exceeds 10MB limit.');
            }

            const uniqueId = uuidv4();
            const targetFileName = `${uniqueId}.gif`;

            const metaData = {
                'Content-Type': 'image/gif',
                'X-Amz-Meta-Email': eMail || '',
                'X-Amz-Meta-PhoneNumber': phoneNumber || '',
                'X-Amz-Meta-CountryCode': countryCode || ''
            };

            await this.minioClient.putObject(this.buckets.profiles, targetFileName, file.buffer, file.size, metaData);
            return targetFileName;
        } else {
            const uniqueId = uuidv4();
            const targetFileName = `${uniqueId}.png`;
            const tempFilePath = path.join('/tmp', targetFileName);

            await sharp(file.buffer).toFormat('png').toFile(tempFilePath);

            const metaData = {
                'Content-Type': 'image/png',
                'X-Amz-Meta-Email': eMail || '',
                'X-Amz-Meta-PhoneNumber': phoneNumber || '',
                'X-Amz-Meta-CountryCode': countryCode || ''
            };

            await this.minioClient.fPutObject(this.buckets.profiles, targetFileName, tempFilePath, metaData);
            fs.unlinkSync(tempFilePath);

            return targetFileName;
        }
    }

    async _uploadComic(file) {
        const uniqueId = uuidv4();
        const targetFileName = `${uniqueId}${path.extname(file.originalname)}`;

        const metaData = {
            'Content-Type': file.mimetype
        };

        await this.minioClient.putObject(this.buckets.comics, targetFileName, file.buffer, metaData);

        return targetFileName;
    }

    /**
     * Görselleri MinIO'ya yükler.
     * @param {Object} file - Yüklenecek dosya (Multer tarafından sağlanan).
     * @param {string} ticketID - Destek talebinin ID'si.
     * @param {string} userID - Kullanıcının ID'si.
     * @param {number} timestamp - Görselin zaman damgası.
     * @returns {Promise<string>} - Yüklenen dosyanın yolunu döndürür.
     */
    async uploadTicketImage(file, ticketID, userID, timestamp) {
        try {
            // Bucket içindeki hedef klasör ve dosya adı
            const folderPath = `${ticketID}/${userID}-${timestamp}`;
            const fileName = `${folderPath}/${uuidv4()}${path.extname(file.originalname)}`;

            const metaData = {
                'Content-Type': file.mimetype,
                'X-Amz-Meta-TicketID': ticketID,
                'X-Amz-Meta-UserID': userID,
                'X-Amz-Meta-Timestamp': timestamp.toString()
            };

            // Dosyayı yükleme
            await this.minioClient.putObject(
                this.buckets.tickets,
                fileName,
                file.buffer,
                file.size,
                metaData
            );

            return fileName;
        } catch (error) {
            console.error('Error uploading ticket image:', error);
            throw new Error('Failed to upload ticket image.');
        }
    }

    /**
     * Görseli siler.
     * @param {string} filePath - Görselin bucket içindeki yolu.
     */
    async deleteTicketImage(filePath) {
        try {
            await this.minioClient.removeObject(this.buckets.tickets, filePath);
        } catch (error) {
            console.error('Error deleting ticket image:', error);
            throw new Error('Failed to delete ticket image.');
        }
    }

    /**
     * Görseli indirir.
     * @param {string} filePath - Görselin bucket içindeki yolu.
     * @returns {Promise<Buffer>} - Görselin içeriğini döndürür.
     */
    async downloadTicketImage(filePath) {
        try {
            const stream = await this.minioClient.getObject(this.buckets.tickets, filePath);
            const chunks = [];
            return new Promise((resolve, reject) => {
                stream.on('data', chunk => chunks.push(chunk));
                stream.on('end', () => resolve(Buffer.concat(chunks)));
                stream.on('error', reject);
            });
        } catch (error) {
            console.error('Error downloading ticket image:', error);
            throw new Error('Failed to download ticket image.');
        }
    }

    /**
     * Görselin görüntülenmesi için bir önceden imzalanmış URL oluşturur.
     * @param {string} filePath - Görselin bucket içindeki yolu.
     * @returns {Promise<string>} - Görselin URL'sini döndürür.
     */
    async getTicketImageURL(filePath) {
        try {
            const url = await this.minioClient.presignedGetObject(this.buckets.tickets, filePath);
            return url;
        } catch (error) {
            console.error('Error generating ticket image URL:', error);
            throw new Error('Failed to generate ticket image URL.');
        }
    }
}

module.exports = StorageService;