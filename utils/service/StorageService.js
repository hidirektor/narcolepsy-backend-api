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
            }
            
            if (bucketName === this.buckets.tickets) {
                await this._createFolderIfNotExists(bucketName, 'ticket-attachments/');
                await this._createFolderIfNotExists(bucketName, 'response-attachments/');
            }
        }
    }

    /**
     * Bucket içinde belirtilen klasör yoksa oluşturur.
     * @param {string} bucketName - Bucket adı.
     * @param {string} folderPath - Klasör yolu.
     */
    async _createFolderIfNotExists(bucketName, folderPath) {
        try {
            const objectName = `${folderPath}.placeholder`;
            const exists = await this.minioClient.statObject(bucketName, objectName).catch(() => null);

            if (!exists) {
                await this.minioClient.putObject(bucketName, objectName, Buffer.from(''), {
                    'Content-Type': 'application/octet-stream'
                });
                console.log(`Folder created: ${folderPath} in bucket: ${bucketName}`);
            }
        } catch (error) {
            console.error(`Error creating folder ${folderPath} in bucket ${bucketName}:`, error);
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

    async deleteFile(bucketName, filePath) {
        try {
            console.log(`Deleting file from bucket: ${bucketName}, filePath: ${filePath}`);
            await this.minioClient.removeObject(bucketName, filePath);
            console.log(`File deleted successfully: ${filePath}`);
        } catch (error) {
            console.error(`Error deleting file: ${filePath}`, error.message);
            throw new Error('Failed to delete file from storage.');
        }
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
     * @param {string} bucketPath - Hedef bucket içinde dosyanın yükleneceği klasör yolu.
     * @returns {Promise<string>} - Yüklenen dosyanın tam yolunu döndürür.
     */
    async uploadTicketImage(file, bucketPath) {
        try {
            const fileName = `${bucketPath}${uuidv4()}${path.extname(file.originalname)}`;
            const metaData = {
                'Content-Type': file.mimetype
            };

            await this.minioClient.putObject(this.buckets.tickets, fileName, file.buffer, file.size, metaData);
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

    /**
     * Deletes all objects within a specified folder in a bucket.
     * @param {string} bucketName - The bucket name.
     * @param {string} folderPath - The folder path to delete.
     * @returns {Promise<void>}
     */
    async deleteFolder(bucketName, folderPath) {
        try {
            const objectsStream = this.minioClient.listObjects(bucketName, folderPath, true);
            const objectsToDelete = [];

            for await (const obj of objectsStream) {
                objectsToDelete.push(obj.name);
            }

            if (objectsToDelete.length > 0) {
                const deleteChunks = [];
                const chunkSize = 1000;

                for (let i = 0; i < objectsToDelete.length; i += chunkSize) {
                    deleteChunks.push(objectsToDelete.slice(i, i + chunkSize));
                }

                for (const chunk of deleteChunks) {
                    await this.minioClient.removeObjects(bucketName, chunk);
                }

                console.log(`Deleted folder: ${folderPath} and its contents in bucket: ${bucketName}`);
            } else {
                console.log(`No objects found in folder: ${folderPath}`);
            }
        } catch (error) {
            console.error(`Error deleting folder ${folderPath} in bucket ${bucketName}:`, error);
            throw new Error('Failed to delete folder.');
        }
    }

    /**
     * Upload a comic banner to a specific folder within the comics bucket.
     * @param {Object} file - The file object (from multer).
     * @param {string} comicID - The comic ID to create a folder for.
     * @returns {Promise<string>} - The path of the uploaded banner.
     */
    async uploadComicBanner(file, comicID) {
        try {
            const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/heic', 'image/png'];
            if (!allowedMimeTypes.includes(file.mimetype)) {
                throw new Error('Invalid file type. Only JPEG, JPG, HEIC, and PNG formats are allowed.');
            }

            const uniqueFileName = `${uuidv4()}.png`;
            const folderPath = `comics/${comicID}/`;
            const targetFilePath = `${folderPath}${uniqueFileName}`;

            const buffer = await sharp(file.buffer)
                .png()
                .toBuffer();

            const metaData = {
                'Content-Type': 'image/png',
            };

            await this.minioClient.putObject(this.buckets.comics, targetFilePath, buffer, metaData);

            return targetFilePath;
        } catch (error) {
            console.error('Error uploading comic banner:', error);
            throw new Error('Failed to upload comic banner.');
        }
    }
}

module.exports = StorageService;