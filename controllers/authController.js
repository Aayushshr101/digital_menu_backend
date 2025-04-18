import User from "../models/User.js"
import { StatusCodes } from "http-status-codes"
import HttpError from '../error/HttpError.js'
import jwt from 'jsonwebtoken'
import { attachCookieToResponse } from "../utils/jwt.js"
import sendVerificationMail from "../utils/sendVerificationMail.js"

const register = async (req, res) => {
    const {username, password, user_type } = req.body

    if (!username || !password || !user_type) {
        throw new HttpError('please provide all values', StatusCodes.BAD_REQUEST)
    }

    const check = await User.findOne({username})
    if(check){
        throw new HttpError('User with that name already exists!', StatusCodes.BAD_REQUEST)
    }
    const user = await User.create({username, password,user_type})
    const tokenUser = { name: user.username, role: user.role, userId: user._id }

    attachCookieToResponse({ res, user: tokenUser })

    res.status(StatusCodes.CREATED).json({ tokenUser })

}

const login = async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) {
        throw new HttpError('please provide all values', StatusCodes.BAD_REQUEST)
    }

    const user = await User.findOne({ username }).select('+password')
    if (!user) {
        throw new HttpError('Couldn\'t find user with that name', StatusCodes.NOT_FOUND)
    }

    const isPasswordCorrect = await user.comparePassword(password)
    if (!isPasswordCorrect) {
        throw new HttpError('invalid email or password', StatusCodes.UNAUTHORIZED)
    }

    const tokenUser = { username: user.username, role: user.role, userId: user._id,user_type:user.user_type,pfp_url:user.pfp_url }
    attachCookieToResponse({ res, user: tokenUser })

    res.status(StatusCodes.OK).json({ tokenUser })
}

const logout = async (req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())              //removing cookie from browser
    })
    res.json({ msg: 'logged out' })
}

const getLoginUser = async (req, res) => {
    const user = await User.findOne({ _id: req.user.userId })

    if (!user) {
        return res.status(StatusCodes.BAD_REQUEST)
    }
    res.status(200).json({ tokenUser: { ...req.user,user_type:user.user_type,pfp_url:user.pfp_url}})
}


export { login, register,logout,getLoginUser }