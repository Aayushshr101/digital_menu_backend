import Order from "../models/Order.js"
import { StatusCodes } from "http-status-codes"
import HttpError from '../error/HttpError.js'

const getDailyStats = async (req, res) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const stats = await calculateStats(today, new Date())

    res.status(StatusCodes.OK).json({ stats })
}

const getWeeklyStats = async (req, res) => {
    const today = new Date()
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    lastWeek.setHours(0, 0, 0, 0)

    const stats = await calculateStats(lastWeek, new Date())

    res.status(StatusCodes.OK).json({ stats })
}

const getMonthlyStats = async (req, res) => {
    const today = new Date()
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
    lastMonth.setHours(0, 0, 0, 0)

    const stats = await calculateStats(lastMonth, new Date())

    res.status(StatusCodes.OK).json({ stats })
}

const getCustomRangeStats = async (req, res) => {
    const { startDate, endDate } = req.query

    if (!startDate || !endDate) {
        throw new HttpError('Please provide both start and end dates', StatusCodes.BAD_REQUEST)
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new HttpError('Invalid date format. Please use YYYY-MM-DD', StatusCodes.BAD_REQUEST)
    }

    const stats = await calculateStats(start, end)

    res.status(StatusCodes.OK).json({ stats })
}

const calculateStats = async (startDate, endDate) => {
    const orders = await Order.find({
        createdAt: { $gte: startDate, $lte: endDate }
    }).populate('items.item')

    let totalRevenue = 0
    let totalOrders = orders.length
    let itemsSold = 0
    let popularItems = {}

    orders.forEach(order => {
        totalRevenue += order.total_amount
        order.items.forEach(item => {
            itemsSold += item.quantity
            if (popularItems[item.item.name]) {
                popularItems[item.item.name] += item.quantity
            } else {
                popularItems[item.item.name] = item.quantity
            }
        })
    })

    const sortedPopularItems = Object.entries(popularItems)
        .sort(([, a], [, b]) => b - a)
        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {})

    return {
        totalRevenue,
        totalOrders,
        itemsSold,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        topSellingItems: Object.keys(sortedPopularItems).slice(0, 5)
    }
}

export {
    getDailyStats,
    getWeeklyStats,
    getMonthlyStats,
    getCustomRangeStats
}