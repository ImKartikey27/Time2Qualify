import { Router } from 'express';
import { uploadEmbeddings, searchTests } from '../controllers/Pinecone.controllers.js';

const router = Router();

router.post('/upload', uploadEmbeddings);
router.post('/search', searchTests);

export default router;