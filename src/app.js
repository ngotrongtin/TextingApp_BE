import express from 'express';
import cors from 'cors';
//import messageRoutes from './routes/message.routes.js';
import homeRoutes from "./routes/home.routes.js";

const app = express();

// Middleware chung
app.use(cors());
app.use(express.json());

// Routes
//app.use('/api/messages', messageRoutes);
app.use(homeRoutes);

export default app;
