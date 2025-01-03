import express, { json, static as static_ } from "express";
import { config } from "dotenv";
import { connectDB } from "./db/connect.js";
import errorHandlerMiddleware from "./middleware/error-handler.js";
import notFoundMiddleware from "./middleware/not-found.js";
import 'express-async-errors';
import morgan from "morgan";
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import productRouter from './routes/productRoutes.js';
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import reviewRouter from './routes/reviewRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import rateLimiter from "express-rate-limit";
import helmet from "helmet";
import xss from "xss-clean";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";

// .env Configuration
config();
// express.js Configuration
const app = express();

// Other Middleware
app.use('trust proxy', 1);
app.use(rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 60, // limit each IP to 60 requests per windowMs
}));
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());

app.use(morgan('tiny'));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(json());

app.use(static_('./public'))
app.use(fileUpload());

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/orders', orderRouter);

app.get('/', (req, res) => {
    res.send('E-Commerce API');
});



// Error Handling Middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5001;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        console.log('Database connection established!')
        app.listen(port, () =>
            console.log(`Server Listening on http://localhost:${port}`)
        );
    } catch (error) {
        console.log(error);
    }
}

start();