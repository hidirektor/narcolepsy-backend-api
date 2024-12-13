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
            comics: 'narcolepsy-backend-comics'
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
}

module.exports = StorageService;