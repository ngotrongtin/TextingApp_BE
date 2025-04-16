import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authMiddleware from './middlewares/auth.js';
//import messageRoutes from './routes/message.routes.js';
import homeRoutes from "./routes/home.routes.js";
import userRoutes from "./routes/user.routes.js";
import userFriendshipsRoutes from './routes/user_friendships.routes.js';
import groupRoutes from './routes/group.routes.js';
const app = express();

app.use(cookieParser());
// Middleware chung
app.use(cors());
app.use(express.json());

// Routes
//app.use('/api/messages', messageRoutes);
app.use(homeRoutes);
app.use('/api/user', userRoutes);
app.use('/api/user_friendships',authMiddleware, userFriendshipsRoutes);
app.use('/api/groups',authMiddleware, groupRoutes);
export default app;
