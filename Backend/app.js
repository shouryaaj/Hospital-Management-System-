import express from "express";
import { config } from "dotenv";
import cors from "cors"
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { dbConnection } from "./database/dbConnection.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import userRouter from "./router/userRouter.js"
import messageRouter from "./router/messageRouter.js"
import appointmentRouter from "./router/appointmentRouter.js"

// Security middleware
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";

const app = express();


config({ path: "./config/config.env" })

// Basic security headers
app.use(helmet());

// Body sanitization
app.use(mongoSanitize());
app.use(xss());

app.use(cors(
    {
        origin: [
            process.env.FRONTEND_PATIENT, 
            process.env.FRONTEND_ADMIN,
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175'
        ],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
))

// Enforce HTTPS in production (use behind proxy/load balancer that sets X-Forwarded-Proto)
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        const proto = req.headers['x-forwarded-proto'];
        if (proto && proto !== 'https') {
            return res.redirect(`https://${req.headers.host}${req.url}`);
        }
        // If direct TLS termination, express will set req.secure
        if (!proto && !req.secure) {
            return res.redirect(`https://${req.headers.host}${req.url}`);
        }
        next();
    });
}

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: 'C:/Windows/Temp/'
}))

// Health check route
app.get('/', (req, res) => {
    res.json({ status: 'Server is running!' });
})

app.use("/api/v1/message", messageRouter)
app.use("/api/v1/user", userRouter)
app.use("/api/v1/appointment", appointmentRouter)

dbConnection();

app.use(errorMiddleware)

export default app;