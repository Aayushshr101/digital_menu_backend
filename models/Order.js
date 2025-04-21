import mongoose from "mongoose"

// Order Model
const OrderSchema = new mongoose.Schema({
    order_number: {
        type: String,
        required: true,
        unique: true,
    },
    table: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table',
        required: true,
    },
    items: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MenuItem',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        price: {
            type: Number,
            required: true,
        },
        customizations: [{
            option_name: String,
            selection: String,
            price_addition: Number,
        }],
        notes: String,
    }],
    status: {
        type: String,
        enum: ['pending', 'preparing', 'served', 'complete', 'cancelled'],
        default: 'pending',
    },
    total_amount: {
        type: Number,
        required: true,
    },
    // Updated payment_status to include 'failed' for eSewa integration
    payment_status: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending',
    },
    // Updated payment_method to include 'esewa'
    payment_method: {
        type: String,
        enum: ['cash', 'online_payment'],
        default: 'cash',
    },
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema)