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
        enum: ['pending', 'paid', 'refunded', 'failed'],
        default: 'pending',
    },
    // Updated payment_method to include 'esewa'
    payment_method: {
        type: String,
        enum: ['cash', 'card', 'esewa', 'not_paid'],
        default: 'not_paid',
    },
    // New fields for eSewa payment integration
    payment_transaction_id: {
        type: String,
        // This will store the transaction ID generated for eSewa
    },
    payment_id: {
        type: String,
        // This will store the reference ID returned by eSewa after successful payment
    },
    payment_date: {
        type: Date,
        // This will store when the payment was completed
    },
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema)