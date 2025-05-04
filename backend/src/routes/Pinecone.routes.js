import { Router } from 'express';
import { uploadEmbeddings, searchTests } from '../controllers/Pinecone.controllers.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';

const router = Router();

//Sercured routes
router.post('/upload',verifyJWT, uploadEmbeddings);
router.post('/search',verifyJWT ,searchTests);

export default router;