import express from "express";
const router = express.Router()

import { authenticateUser } from "../middlewares/atuh.js";
import {
    getDailyStats,
    getWeeklyStats,
    getMonthlyStats,
    getCustomRangeStats
} from "../controllers/statisticsController.js"

router.get("/daily", authenticateUser, getDailyStats)
router.get("/weekly", authenticateUser, getWeeklyStats)
router.get("/monthly", authenticateUser, getMonthlyStats)
router.get("/custom", authenticateUser, getCustomRangeStats)

export default router