import mongoose from "mongoose"


// Category Model
const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide category name'],
        unique: true,
        trim: true,
    },
    description: {
        type: String,
    },
    display_order: {
        type: Number,
        default: 0,
    },
    thumbnail_url: {
        type: String,
        default:"https://res.cloudinary.com/ducxipxkt/image/upload/c_thumb,w_200,g_face/v1738131384/digital_menu/Categories/default.jpg",
    }
}, { timestamps: true });

export default mongoose.model('Category', CategorySchema)