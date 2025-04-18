import mongoose from "mongoose"


// MenuItem Model
const MenuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide item name'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please provide item description'],
    },
    price: {
        type: Number,
        required: [true, 'Please provide price'],
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Please provide category'],
    },
    image_url: {
        type: String,
        default: 'https://res.cloudinary.com/ducxipxkt/image/upload/v1741362559/digital_menu/MenuItems/default_nddayf.jpg',
    },
    customization_options: [{
        name: String,
        options: [{
            name: String,
            price_addition: Number,
        }],
    }],
    is_available: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

export default mongoose.model('MenuItem', MenuItemSchema)