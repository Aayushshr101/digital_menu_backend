import MenuItem from "../models/MenuItem.js"
import Category from "../models/Category.js"
import { StatusCodes } from "http-status-codes"
import HttpError from '../error/HttpError.js'

import { v2 as cloudinary } from "cloudinary"
import fs from 'fs'

const getAllMenuItems = async (req, res) => {
    const menuItems = await MenuItem.find({}).populate('category')
    res.status(StatusCodes.OK).json({ menuItems, count: menuItems.length })
}

const createMenuItem = async (req, res) => {
    const { name, description, price, category, customization_options } = req.body

    if (!name || !description || !price || !category) {
        throw new HttpError('Please provide all required values', StatusCodes.BAD_REQUEST)
    }

    const categoryExists = await Category.findById(category)
    if (!categoryExists) {
        throw new HttpError('Invalid category', StatusCodes.BAD_REQUEST)
    }

    const menuItem = await MenuItem.create({
        name,
        description,
        price,
        category,
        customization_options
    })

    res.status(StatusCodes.CREATED).json({ menuItem })
}

const uploadMenuImage = async (req,res)=>{
    const { id: menuItemId } = req.params
    const image = req.files?.image

    const existingMenuItem = await MenuItem.findById(menuItemId)
    if (!existingMenuItem) {
        throw new HttpError(`No menu item with id: ${menuItemId}`, StatusCodes.NOT_FOUND)
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
                folder: 'digital_menu/MenuItems'
            })

            // Remove temp file
            fs.unlink(image.tempFilePath, (err) => {
                if (err) console.log('Error removing temp file:', err)
            })

            // Add the new image URL to the update object
            updateObject.image_url = uploadedImage.secure_url

            // Delete the old image from Cloudinary if it exists
            if (existingMenuItem.image_url) {
                try {
                    // Extract the public_id from the existing image URL
                    const urlParts = existingMenuItem.image_url.split('/')
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
    const menuItem = await MenuItem.findOneAndUpdate(
        { _id: menuItemId },
        updateObject,
        { new: true, runValidators: true }
    )

    res.status(StatusCodes.OK).json({ menuItem })
}

const getSingleMenuItem = async (req, res) => {
    const { id: menuItemId } = req.params
    const menuItem = await MenuItem.findOne({ _id: menuItemId }).populate('category')

    if (!menuItem) {
        throw new HttpError(`No menu item with id: ${menuItemId}`, StatusCodes.NOT_FOUND)
    }

    res.status(StatusCodes.OK).json({ menuItem })
}

const updateMenuItem = async (req, res) => {
    const { id: menuItemId } = req.params
    const { name, description, price, category, image_url, customization_options, is_available } = req.body

    if (category) {
        const categoryExists = await Category.findById(category)
        if (!categoryExists) {
            throw new HttpError('Invalid category', StatusCodes.BAD_REQUEST)
        }
    }

    const menuItem = await MenuItem.findOneAndUpdate(
        { _id: menuItemId },
        { name, description, price, category, image_url, customization_options, is_available },
        { new: true, runValidators: true }
    )

    if (!menuItem) {
        throw new HttpError(`No menu item with id: ${menuItemId}`, StatusCodes.NOT_FOUND)
    }

    res.status(StatusCodes.OK).json({ menuItem })
}

const deleteMenuItem = async (req, res) => {
    const { id: menuItemId } = req.params
    const menuItem = await MenuItem.findOneAndDelete({ _id: menuItemId })

    if (!menuItem) {
        throw new HttpError(`No menu item with id: ${menuItemId}`, StatusCodes.NOT_FOUND)
    }

    res.status(StatusCodes.OK).json({ msg: 'Menu item removed' })
}

const getItemsByCategory = async (req, res) => {
    const { categoryId } = req.params
    const menuItems = await MenuItem.find({ category: categoryId }).populate('category')

    if (!menuItems.length) {
        throw new HttpError(`No menu items found for category: ${categoryId}`, StatusCodes.NOT_FOUND)
    }

    res.status(StatusCodes.OK).json({ menuItems, count: menuItems.length })
}

export {
    getAllMenuItems,
    createMenuItem,
    getSingleMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getItemsByCategory,
    uploadMenuImage
}