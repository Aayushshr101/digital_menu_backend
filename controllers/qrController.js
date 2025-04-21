const { StatusCodes } = require('http-status-codes')
const cloudinary = require('cloudinary').v2
const fs = require('fs')

// We'll store the QR code URL in this variable
// In a real application, you might want to store this in a database
let qrCodeUrl = '';

// Upload QR code image
const uploadQRCode = async (req, res) => {
    try {
        const image = req.files?.image;
        
        if (!image) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                success: false, 
                msg: 'Please upload an image' 
            });
        }

        // Validate image
        if (!image.mimetype.startsWith('image')) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                success: false, 
                msg: 'Please upload an image file' 
            });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(image.tempFilePath, {
            use_filename: true,
            folder: 'payment_qr',
            public_id: 'payment_qr_code', // Always use the same name to overwrite
        });

        // Remove temp file
        fs.unlinkSync(image.tempFilePath);

        // Store the URL
        qrCodeUrl = result.secure_url;

        return res.status(StatusCodes.OK).json({
            success: true,
            qrCode: {
                image_url: qrCodeUrl
            }
        });
    } catch (error) {
        console.error('Error uploading QR code:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            msg: 'Error uploading QR code'
        });
    }
}

// Get QR code
const getQRCode = async (req, res) => {
    if (!qrCodeUrl) {
        return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            msg: 'QR code not found'
        });
    }

    return res.status(StatusCodes.OK).json({
        success: true,
        qrCode: {
            image_url: qrCodeUrl
        }
    });
}

module.exports = {
    uploadQRCode,
    getQRCode
}