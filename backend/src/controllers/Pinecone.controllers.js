import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import  pineconeService  from '../services/Pinecone.services.js';

const uploadEmbeddings = asyncHandler(async (req, res) => {
    const result = await pineconeService.upsertEmbeddings();
    
    return res.status(200).json(
        new ApiResponse(200, result, "Embeddings uploaded successfully")
    );
});

const searchTests = asyncHandler(async (req, res) => {
    const { embedding, limit = 5 } = req.body;

    if (!embedding) {
        throw new ApiError(400, "Embedding vector is required");
    }

    const results = await pineconeService.searchSimilarTests(embedding, limit);
    
    return res.status(200).json(
        new ApiResponse(200, results, "Similar tests retrieved successfully")
    );
});

export { uploadEmbeddings, searchTests };