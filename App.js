import express from 'express'
const app = express()
import dotenv from 'dotenv'
dotenv.config()
import cors from 'cors'
import expressAsyncErrors from 'express-async-errors'
import cookieParser from 'cookie-parser'
import moran from 'morgan'
import { v2 as cloudinary } from 'cloudinary'
import fileUpload from 'express-fileupload'

import connectDB from './db/connect.js'

import notFoundMiddleware from './middlewares/notFound.js'
import errorHandlerMiddleware from './middlewares/errorHandler.js'
import { authenticateUser, authorizePermissions } from "./middlewares/atuh.js";


import authRouter from './routes/authRoutes.js'
import menuRouter from './routes/menuRoutes.js'
import categoryrRouter from './routes/categoryRoutes.js'
import tableRouter from './routes/tableRoutes.js'
import orderRouter from './routes/orderRoutes.js'
import usersRouter from './routes/userRoutes.js'


const corsOptions = {
    origin: ['http://localhost:3000','https://digital-menu-frontend-sable.vercel.app'],
    credentials: true,
    optionsSuccessStatus: 200
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


app.use(cors(corsOptions)) 
app.use(moran('dev'))
app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))
app.use(fileUpload({ useTempFiles: true }))


app.use('/api/v1/auth', authRouter)
app.use('/api/v1/menu',menuRouter);
app.use('/api/v1/categories',categoryrRouter);
app.use('/api/v1/tables',tableRouter);
app.use('/api/v1/orders',orderRouter);


app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)


const port = process.env.PORT || 5000
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port,'0.0.0.0' ,console.log(` server listening on port ${port}...`))
    } catch (error) {
        console.log(error)
    }
}

start()