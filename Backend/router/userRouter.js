import express from "express"
import rateLimit from "express-rate-limit"
import { addNewAdmin, addNewDoctor, getAllDoctors, getUserDetails, login, logoutAdmin, logoutPatient, patientRegister } from "../controller/userController.js";
import { isAdminAuthenticated, isPatientAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Rate limiter for auth endpoints: protect against brute force
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // limit each IP to 10 requests per windowMs
	standardHeaders: true,
	legacyHeaders: false,
	message: 'Too many requests from this IP, please try again later.'
});

router.post("/patient/register", authLimiter, patientRegister)
router.post("/login", authLimiter, login)
router.post("/admin/addnew", isAdminAuthenticated, addNewAdmin)
router.get("/doctors", getAllDoctors)
router.get("/admin/me", isAdminAuthenticated, getUserDetails)
router.get("/patient/me", isPatientAuthenticated, getUserDetails)
router.get("/admin/logout", isAdminAuthenticated, logoutAdmin)
router.get("/patient/logout", isPatientAuthenticated, logoutPatient)
router.post("/doctor/addnew", isAdminAuthenticated, addNewDoctor)



export default router;
