import express from "express"
import * as vendorDashboardController from "../controllers/vendor-dashboard.controller"
import { authenticate, authorize } from "../middleware/auth.middleware"

const router = express.Router()

// Protected admin routes
router.use(authenticate)
router.use(authorize(["admin", "superadmin"]))

router.get("/vendors/:vendorId/dashboard", vendorDashboardController.getVendorDashboardSummaryAdmin)

export default router
