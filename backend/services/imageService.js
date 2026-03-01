const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function processImage(buffer) {
    return sharp(buffer)
        .resize(1024, 1024, {
            fit: 'inside',
            withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toBuffer();
}

async function uploadToCloudinary(buffer, folder) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: `styleai/${folder}`, resource_type: 'image' },
            (error, result) => {
                if (error) reject(error);
                else resolve({ url: result.secure_url, cloudinaryId: result.public_id });
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
}

async function processAndUpload(buffer, folder) {
    const processed = await processImage(buffer);
    return uploadToCloudinary(processed, folder);
}

async function deleteFromCloudinary(cloudinaryId) {
    await cloudinary.uploader.destroy(cloudinaryId);
}

module.exports = { processAndUpload, deleteFromCloudinary };
