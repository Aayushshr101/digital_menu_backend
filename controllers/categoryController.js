import Category from "../models/Category.js"
import { StatusCodes } from "http-status-codes"
import HttpError from '../error/HttpError.js'

import { v2 as cloudinary } from "cloudinary"
import fs from 'fs'

const getAllCategories = async (req, res) => {
    const categories = await Category.find({})
    res.status(StatusCodes.OK).json({ categories, count: categories.length })
}

const createCategory = async (req, res) => {
    const { name, description, display_order } = req.body

    if (!name) {
        throw new HttpError('Please provide category name', StatusCodes.BAD_REQUEST)
    }

    const categoryExists = await Category.findOne({ name })
    if (categoryExists) {
        throw new HttpError('Category with this name already exists', StatusCodes.BAD_REQUEST)
    }

    const category = await Category.create({
        name,
        description,
        display_order
    })

    res.status(StatusCodes.CREATED).json({ category })
}

const uploadCategoryImage = async (req, res) => {
    const { id: categoryId } = req.params
    const image = req.files?.image

    if(!image){
        throw new HttpError("image not sent ",StatusCodes.BAD_REQUEST)
    }

    const existingCategory = await Category.findById(categoryId)
    if (!existingCategory) {
        throw new HttpError(`No menu item with id: ${categoryId}`, StatusCodes.NOT_FOUND)
    }

    const updateObject = {}

    if (image) {
        // Validate image
        if (!image.mimetype.startsWith('image')) {
            throw new HttpError('Invalid file type', StatusCodes.BAD_REQUEST)
        }
        if (image.size > 10000000) { // 10MB limit
            throw new HttpError('Image too large', StatusCodes.BAD_REQUEST)
        }

        try {
            // Upload new image to Cloudinary
            const uploadedImage = await cloudinary.uploader.upload(image.tempFilePath, {
                use_filename: true,
                filename_override: image.name,
                folder: 'digital_menu/Categories'
            })

            // Remove temp file
            fs.unlink(image.tempFilePath, (err) => {
                if (err) console.log('Error removing temp file:', err)
            })

            // Add the new image URL to the update object
            updateObject.thumbnail_url = uploadedImage.secure_url

            // Delete the old image from Cloudinary if it exists
            if (existingCategory.image_url) {
                try {
                    // Extract the public_id from the existing image URL
                    const urlParts = existingCategory.image_url.split('/')
                    const publicIdWithExtension = urlParts.slice(urlParts.indexOf('digital_menu')).join('/')
                    const publicId = publicIdWithExtension.split('.')[0] // Remove file extension

                    // Delete the image from Cloudinary
                    await cloudinary.uploader.destroy(publicId)
                } catch (error) {
                    console.log('Error deleting old image from Cloudinary:', error)
                    // Continue with the update even if deleting the old image fails
                }
            }
        } catch (error) {
            console.log(error)
            throw new HttpError('Error uploading image', StatusCodes.INTERNAL_SERVER_ERROR)
        }
    }

    // Update the menu item with all the changes
    const cat = await Category.findOneAndUpdate(
        { _id: categoryId },
        updateObject,
        { new: true, runValidators: true }
    )

    res.status(StatusCodes.OK).json({ cat })
}

const getSingleCategory = async (req, res) => {
    const { id: categoryId } = req.params
    const category = await Category.findOne({ _id: categoryId })

    if (!category) {
        throw new HttpError(`No category with id: ${categoryId}`, StatusCodes.NOT_FOUND)
    }

    res.status(StatusCodes.OK).json({ category })
}

const updateCategory = async (req, res) => {
    const { id: categoryId } = req.params
    const { name, description, display_order } = req.body

    if (name) {
        const categoryExists = await Category.findOne({ name, _id: { $ne: categoryId } })
        if (categoryExists) {
            throw new HttpError('Category with this name already exists', StatusCodes.BAD_REQUEST)
        }
    }

    const category = await Category.findOneAndUpdate(
        { _id: categoryId },
        { name, description, display_order },
        { new: true, runValidators: true }
    )

    if (!category) {
        throw new HttpError(`No category with id: ${categoryId}`, StatusCodes.NOT_FOUND)
    }

    res.status(StatusCodes.OK).json({ category })
}

const deleteCategory = async (req, res) => {
    const { id: categoryId } = req.params
    const category = await Category.findOneAndDelete({ _id: categoryId })

    if (!category) {
        throw new HttpError(`No category with id: ${categoryId}`, StatusCodes.NOT_FOUND)
    }

    res.status(StatusCodes.OK).json({ msg: 'Category removed' })
}

export {
    getAllCategories,
    createCategory,
    getSingleCategory,
    updateCategory,
    deleteCategory,
    uploadCategoryImage
}