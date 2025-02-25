import express from 'express';
import {home} from '../controllers/home.controller.js';

const router = express.Router();

router.get('/', home);

export default router;
