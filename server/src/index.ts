import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './models/DBconnection';
import db from './models';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user';
import newsRoutes from './routes/news';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.get('/', (req, res) => { res.send('Server is running...'); });
app.use('/api/users', userRoutes);
app.use('/api/news', newsRoutes);
app.get('*', (req, res) => { res.status(404).send('Sorry, not found 😞'); })

// Create HTTP Server
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    },
});

// Handle Socket.io Connection
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Start Server
const SERVER_PORT = process.env.SERVER_PORT;
const startServer = async () => {
    try {
        // Connect Database
        await connectDB();

        // Synchronize Models with the Database
        await db.sequelize.sync({ alter: true });
        console.log('🔄 All models were synchronized successfully.');

        // Start the Application Server
        httpServer.listen(SERVER_PORT, () => {
            console.log(`🚀 Server is running on port http://localhost:${SERVER_PORT}`);
        });
    } catch (error) {
        console.log(`😞 Sorry, something went wrong! ${error}`);
    }
};

startServer();