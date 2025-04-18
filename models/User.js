import mongoose from "mongoose"
import validator from "validator"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'pleaase provide name'],
        maxLength: 20,
        trim: true,
    },
    // email: {
    //     type: String,
    //     required: [true, 'pleaase provide email'],
    //     validate: {
    //         validator: validator.isEmail,    //don't invoke pass by reference
    //         message: 'Please provide a valid email',
    //     },
    //     unique: true,
    // },
    password: {
        type: String,
        required: [true, 'please provide password'],
        // validate: {
        //     validator: function (password) {
        //         // Add your password strength criteria here
        //         const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
        //         return regex.test(password);
        //     },
        //     message: 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character'
        // },
        select: false
    },
    user_type: {
        type: String,
        enum:['admin','costumer'],
        required: [true, 'please provide user type'],
    },
    role: {
        type: String,
        enum: ['costumer', 'admin', 'owner'],
        default: 'admin'
    },
    pfp_url:{
        type:String,
        default:'https://res.cloudinary.com/ducxipxkt/image/upload/v1727721201/rent_app/profile_pics/default_profile_400x400_zkc1hd.png'
    }


}, { timestamps: true })

//note: this is triggered by Model.save() but not by Model.findOneAndUpdate()
UserSchema.pre('save', async function (next) {

    if (!this.isModified('password')) return

    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)
})


UserSchema.methods.comparePassword = async function (submittedPassword) {
    const isMatch = await bcrypt.compare(submittedPassword, this.password)
    return isMatch
}

export default mongoose.model('User', UserSchema)