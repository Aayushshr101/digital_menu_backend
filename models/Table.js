import mongoose from "mongoose"


// Table Model
const TableSchema = new mongoose.Schema({
    table_number: {
        type: String,
        required: [true, 'Please provide table number'],
        unique: true,
    },
    capacity: {
        type: Number,
        required: [true, 'Please provide seating capacity'],
    },
    status: {
        type: String,
        enum: ['available', 'occupied', 'reserved', 'maintenance'],
        default: 'available',
    },
    current_order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    },
}, { timestamps: true });

export default mongoose.model('Table', TableSchema)